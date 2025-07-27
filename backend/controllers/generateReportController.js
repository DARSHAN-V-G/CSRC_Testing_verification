const PDFDocument = require("pdfkit");
const {
  Report
} = require("../models/TestModel");
const {findDepartment} = require("../utils/reportUtils");
const UserModel = require("../models/UserModel")

function formatCurrency(num) {
    return Number(num).toFixed(2);
}

// Dynamic Column Width Calculation Function
function calculateOptimalColumnWidths(data, headers, doc, minWidths, maxTableWidth) {
  const headerWidths = headers.map(header => doc.widthOfString(header) + 20); // 20px padding
  const contentWidths = data.map(row => 
    row.map(cell => doc.widthOfString(String(cell)) + 20)
  );
  
  // Calculate maximum width needed for each column
  const maxWidths = headers.map((header, colIndex) => {
    const headerWidth = headerWidths[colIndex];
    const maxContentWidth = Math.max(...contentWidths.map(row => row[colIndex] || 0));
    return Math.max(headerWidth, maxContentWidth, minWidths[colIndex]);
  });
  
  // If total width exceeds available space, proportionally reduce
  const totalWidth = maxWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > maxTableWidth) {
    const scaleFactor = maxTableWidth / totalWidth;
    return maxWidths.map((width, index) => Math.max(width * scaleFactor, minWidths[index]));
  }
  
  return maxWidths;
}

const generateReport = async (req, res) => {
  try {
    const ref_no = req.params.ref_no;
    if (!ref_no) {
      return res.status(400).json({
        message: "Reference Number is required",
      });
    }
    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) return res.status(404).json({ message: "Report not found" });

    let hod_name = ""; 
    const hodUsers = await UserModel.find({ role: "hod" });
    
    for (const hodUser of hodUsers) {
      const hodDepartment = findDepartment(hodUser.email);
      
      if (hodDepartment && hodDepartment === report.department) {
        hod_name = hodUser.username;
        break; 
      }
    }

    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=report_${report.ref_no}.pdf`);
    doc.pipe(res);

    // Header Section
    doc.y = doc.y-25
    doc.fontSize(16).font('Helvetica-Bold').text('PSG COLLEGE OF TECHNOLOGY - 641 004', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Phone: 0422-4344777    Extn : 4448', { align: 'center' });
    doc.moveDown();
    
    // Department (right aligned)
    doc.fontSize(12).text(`DEPARTMENT: ${report.department}`, { align: 'left' });
    doc.fontSize(12).text(`LAB: ${report.lab}`, { align: 'left' });
    doc.moveDown();
    
    // Testing/Consultancy Details (centered and underlined)
    const consultancyText = report.category || "Testing"; 
    const textWidth = doc.widthOfString(consultancyText);
    const pageCenter = (doc.page.width - 2 * doc.page.margins.left) / 2;
    const startX = pageCenter - (textWidth /2 ) + 30;
    
    doc.fontSize(14).font('Helvetica-Bold').text(consultancyText, { align: 'center' });
    doc.moveTo(startX, doc.y).lineTo(startX + textWidth + 40, doc.y).stroke();
    doc.moveDown();

    // Reference and Date (on same line)
    const refDate = doc.y;
    doc.fontSize(11).font('Helvetica')
      .text(`Ref: ${report.ref_no}`, { align: 'left' })
      .text(`Date: ${new Date(report.createdAt).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })}`, doc.x + 425, refDate);
    doc.moveDown(0.5);

    // Client Details Table with Dynamic Column Widths
    const clientDetails = [
      ['Client\'s Name', report.client_name || '-'],
      ['Client Letter/PO No.', report.client_po_no || '-'],
      ['Client Letter / PO received on', report.client_po_recieved_date ? new Date(report.client_po_recieved_date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) : '-'],
      ['Bill to be sent to : ', report.bill_to_be_sent_mail_address ? report.bill_to_be_sent_mail_address.replace(/[\r\n]+/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, '') : '-'],
      ['GST No.', report.gst_no || '-']
    ];

    // Calculate dynamic column widths for client table
    const clientHeaders = ['Field', 'Value'];
    const clientMinWidths = [140, 180]; // Minimum widths
    const clientMaxTableWidth = 530; // Available table width
    const clientColWidths = calculateOptimalColumnWidths(clientDetails, clientHeaders, doc, clientMinWidths, clientMaxTableWidth);

    let yPos = doc.y;
    const clientTableWidth = clientColWidths.reduce((sum, width) => sum + width, 0);
    let totalTableHeight = 0;

    // Calculate total table height with dynamic row heights
    clientDetails.forEach(([label, value]) => {
      let rowHeight = 20; // Default height
      if (value && value.length > 50) {
        const availableWidth = clientColWidths[1] - 20; // Second column width minus padding
        const textWidth = doc.widthOfString(value);
        const numberOfLines = Math.ceil(textWidth / availableWidth);
        rowHeight = Math.max(20, numberOfLines * 15);
      }
      totalTableHeight += rowHeight;
    });

    // Draw outer rectangle
    doc.rect(50, yPos, clientTableWidth, totalTableHeight).stroke();

    // Draw vertical line between columns
    doc.moveTo(50 + clientColWidths[0], yPos)
       .lineTo(50 + clientColWidths[0], yPos + totalTableHeight)
       .stroke();

    let currentYPos = yPos;

    // Draw horizontal lines and content
    clientDetails.forEach(([label, value], index) => {
      let rowHeight = 20;
      if (value && value.length > 50) {
        const availableWidth = clientColWidths[1] - 20;
        const textWidth = doc.widthOfString(value);
        const numberOfLines = Math.ceil(textWidth / availableWidth);
        rowHeight = Math.max(20, numberOfLines * 15);
      }
      
      // Draw horizontal line after this row (except for the last row)
      if (index < clientDetails.length - 1) {
        currentYPos += rowHeight;
        doc.moveTo(50, currentYPos)
           .lineTo(50 + clientTableWidth, currentYPos)
           .stroke();
      }
    });

    // Render text content
    currentYPos = yPos;
    clientDetails.forEach(([label, value], index) => {
      let rowHeight = 20;
      if (value && value.length > 50) {
        const availableWidth = clientColWidths[1] - 20;
        const textWidth = doc.widthOfString(value);
        const numberOfLines = Math.ceil(textWidth / availableWidth);
        rowHeight = Math.max(20, numberOfLines * 15);
      }
      
      const rowY = currentYPos + 5;
      
      // Render text with proper column widths
      doc.fontSize(11)
         .text(label, 55, rowY, { width: clientColWidths[0] - 10 });
      doc.text(value, 55 + clientColWidths[0], rowY, { width: clientColWidths[1] - 10 });
      
      currentYPos += rowHeight;
    });
    
    doc.moveDown(1);

    // Test Details Table with Dynamic Column Widths
    const tableTop = doc.y;
    const tableHeaders = ['S.No', 'Particulars', 'Rate', 'Unit', 'Quantity', 'Amount'];

    // Prepare test data for width calculation
    const testTableData = report.test.map((item, index) => [
      (index + 1).toString(),
      item.title,
      formatCurrency(item.pricePerUnit),
      item.unit,
      item.quantity.toString(),
      formatCurrency(item.pricePerUnit * item.quantity)
    ]);

    // Calculate dynamic column widths for test table
    const testMinWidths = [40, 150, 60, 40, 60, 80]; // Minimum widths
    const testMaxTableWidth = 530; // Available table width
    const testColWidths = calculateOptimalColumnWidths(testTableData, tableHeaders, doc, testMinWidths, testMaxTableWidth);
    const totalTableWidth = testColWidths.reduce((sum, width) => sum + width, 0);

    let currentTop = tableTop;

    // Draw outer rectangle for test details table
    doc.rect(50, currentTop, totalTableWidth, 25).stroke();

    // Draw headers and vertical lines
    let xPos = 50;
    tableHeaders.forEach((header, i) => {
      doc.font('Helvetica-Bold').text(header, xPos + 5, currentTop + 7, { 
        width: testColWidths[i] - 10,
        align: 'center'
      });
      
      // Draw vertical lines except for the last column
      if (i < tableHeaders.length - 1) {
        doc.moveTo(xPos + testColWidths[i], currentTop)
           .lineTo(xPos + testColWidths[i], currentTop + 25)
           .stroke();
      }
      xPos += testColWidths[i];
    });

    currentTop += 25;
    let totalAmount = 0;

    // Draw rows with dynamic column widths
    report.test.forEach((item, index) => {
      // Calculate row height based on longest text in the row
      const availableWidth = testColWidths[1] - 20; // Particulars column
      const titleWidth = doc.widthOfString(item.title);
      const numberOfLines = Math.ceil(titleWidth / availableWidth);
      const rowHeight = Math.max(25, numberOfLines * 15);
      
      const amount = item.pricePerUnit * item.quantity;
      totalAmount += amount;

      // Draw row rectangle
      doc.rect(50, currentTop, totalTableWidth, rowHeight).stroke();

      // Draw vertical lines for each column
      xPos = 50;
      testColWidths.forEach((width, i) => {
        if (i < testColWidths.length - 1) {
          doc.moveTo(xPos + width, currentTop)
             .lineTo(xPos + width, currentTop + rowHeight)
             .stroke();
        }
        xPos += width;
      });

      // Add row content with proper column positioning
      doc.font('Helvetica');
      xPos = 50;
      
      // S.No
      doc.text((index + 1).toString(), xPos + 5, currentTop + 5, { 
        width: testColWidths[0] - 10, 
        align: 'center' 
      });
      xPos += testColWidths[0];
      
      // Particulars
      doc.text(item.title, xPos + 5, currentTop + 5, { 
        width: testColWidths[1] - 10 
      });
      xPos += testColWidths[1];
      
      // Rate
      doc.text(formatCurrency(item.pricePerUnit), xPos + 5, currentTop + 5, { 
        width: testColWidths[2] - 10, 
        align: 'right' 
      });
      xPos += testColWidths[2];
      
      // Unit
      doc.text(item.unit, xPos + 5, currentTop + 5, { 
        width: testColWidths[3] - 10, 
        align: 'center' 
      });
      xPos += testColWidths[3];
      
      // Quantity
      doc.text(item.quantity.toString(), xPos + 5, currentTop + 5, { 
        width: testColWidths[4] - 10, 
        align: 'center' 
      });
      xPos += testColWidths[4];
      
      // Amount
      doc.text(formatCurrency(amount), xPos + 5, currentTop + 5, { 
        width: testColWidths[5] - 10, 
        align: 'right' 
      });

      currentTop += rowHeight;
    });

    // Subtotal row
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    xPos = 50;
    testColWidths.forEach((width, i) => {
      if (i < testColWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 20)
           .stroke();
      }
      xPos += width;
    });

    doc.font('Helvetica-Bold');
    // Position "Sub Total" in the Particulars column
    xPos = 50 + testColWidths[0];
    doc.text('Sub Total', xPos + 5, currentTop + 7, { width: testColWidths[1] - 10 });
    // Position amount in the Amount column
    xPos = 50 + testColWidths.slice(0, -1).reduce((sum, width) => sum + width, 0);
    doc.text(formatCurrency(totalAmount), xPos + 5, currentTop + 7, { 
      width: testColWidths[testColWidths.length - 1] - 10, 
      align: 'right' 
    });

    currentTop += 20;

    // GST row
    const gstAmount = totalAmount * 0.18;
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    xPos = 50;
    testColWidths.forEach((width, i) => {
      if (i < testColWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 20)
           .stroke();
      }
      xPos += width;
    });

    xPos = 50 + testColWidths[0];
    doc.text('GST (18%)', xPos + 5, currentTop + 7, { width: testColWidths[1] - 10 });
    xPos = 50 + testColWidths.slice(0, -1).reduce((sum, width) => sum + width, 0);
    doc.text(formatCurrency(gstAmount), xPos + 5, currentTop + 7, { 
      width: testColWidths[testColWidths.length - 1] - 10, 
      align: 'right' 
    });

    currentTop += 20;

    // Grand Total row
    const grandTotal = totalAmount + gstAmount;
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    xPos = 50;
    testColWidths.forEach((width, i) => {
      if (i < testColWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 20)
           .stroke();
      }
      xPos += width;
    });

    xPos = 50 + testColWidths[0];
    doc.text('Grand Total', xPos + 5, currentTop + 7, { width: testColWidths[1] - 10 });
    xPos = 50 + testColWidths.slice(0, -1).reduce((sum, width) => sum + width, 0);
    doc.text(formatCurrency(grandTotal), xPos + 5, currentTop + 7, { 
      width: testColWidths[testColWidths.length - 1] - 10, 
      align: 'right' 
    });

    // Payment Details (right aligned)
    doc.x = 50;
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica')
      .text(`Payment Status: ${report.paid ? 'Paid' : 'Not Paid'}                                                        Mode of Payment: ${report.payment_mode? report.payment_mode : '-'}`, { align: 'left' })
      .moveDown(0.5);

    // Add a simple table with one row and two columns (no heading)
    const specialTableY = doc.y + 5;
    const specialColWidth = 265;
    const specialTableWidth = specialColWidth * 2;
    const specialRowHeight = 20;

    // Draw the table outline
    doc.rect(50, specialTableY, specialTableWidth, specialRowHeight).stroke();

    // Draw the vertical divider line between columns
    doc.moveTo(specialColWidth+170, specialTableY)
      .lineTo(specialColWidth+170, specialTableY + specialRowHeight)
      .stroke();

    // Add content to the cells
    doc.font('Helvetica').fontSize(12);
    doc.text(`Transaction Details : ${report.transaction_details? report.transaction_details : '-'}`, 60, specialTableY + 5, { 
      width: specialColWidth - 20,
      align: 'left'
    });
    doc.text(`Dated : ${report.transaction_date ? new Date(report.transaction_date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }) : '-'}`, 170 + specialColWidth + 5, specialTableY + 5, {
      width: specialColWidth - 20,
      align: 'left'
    });

    // Update the y position after the table
    doc.y = specialTableY + specialRowHeight;
    doc.x = doc.x-specialColWidth;
    const specialTableY2 = doc.y + 10;
    const specialColWidth2 = 265;
    const specialTableWidth2 = specialColWidth2 * 2;
    const specialRowHeight2 = 20;

    doc.rect(50, specialTableY2, specialTableWidth2, specialRowHeight2).stroke();

    // Draw the vertical divider line between columns
    doc.moveTo(specialColWidth2-100, specialTableY2)
      .lineTo(specialColWidth2-100, specialTableY2 + specialRowHeight2)
      .stroke();

    // Add content to the cells
    doc.font('Helvetica').fontSize(12);
    doc.text('Faculty in Charge:', 60, specialTableY2 + 5, { 
      width: specialColWidth2 - 20,
      align: 'left'
    });
    doc.text(`${report.faculty_incharge}`, specialColWidth2 + 5-100, specialTableY2 + 5, {
      width: specialColWidth2 - 20,
      align: 'left'
    });

    // Update the y position after the table
    doc.y = specialTableY2 + specialRowHeight2 + 15;
    doc.x = doc.x-120
    doc.fontSize(12).font('Helvetica-Bold')
      .text(`Prepared by : ${report.prepared_by}`);
    let xrect = doc.x
    let yrect = doc.y+10
    let columnwidth = 264
    doc.rect(xrect,yrect,2*columnwidth,20).stroke();
    doc.moveTo(xrect+120,yrect)
      .lineTo(xrect+120,yrect+20)
      .stroke();
    doc.font('Helvetica')
    .text("Receipt No & Date : ",xrect+5,yrect+6);
    doc.font('Helvetica')
    .text(`${report.receipt_no ? report.receipt_no : '-'} ${report.receipt_date ? ', ' + new Date(report.receipt_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}`,xrect+5+120,yrect+6);
    xrect = doc.x - 125
    yrect = doc.y+10
    doc.rect(xrect,yrect,2*columnwidth,20).stroke();
    doc.moveTo(xrect+120,yrect)
      .lineTo(xrect+120,yrect+20)
      .stroke();
    doc.font('Helvetica')
    .text("Bill No & Date : ",xrect+5,yrect+6);
    doc.font('Helvetica')
    .text(`${report.receipt_no ? report.receipt_no : '-'} ${report.receipt_date ? ', ' + new Date(report.receipt_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}`,xrect+5+120,yrect+6);
    doc.x = xrect;
    doc.y = yrect + 35;
    const flag = report.verified_flag;
    doc.text("Verified by :");
    const xflag = doc.x;
    const yflag = doc.y

    const csrcOffice = await UserModel.findOne({role:"office"});
    const csrcFaculty = await UserModel.findOne({role:"faculty"});
    const dean = await UserModel.findOne({role:"dean"});
    
    for(let i = 1; i < flag + 1; i++){
      if(i==1){
        doc.text(`${i}. ${hod_name} (HOD)`);
      }else if(i==2 && csrcOffice){
        doc.text(`${i}. ${csrcOffice.username} (CSRC - Office)`);
      }else if(i==3 && csrcFaculty){
        doc.text(`${i}. ${csrcFaculty.username} (CSRC - Faculty)`);
      }else if(i==4 && dean){
        doc.text(`${i}. ${dean.username} (Dean)`);
      }
    }
    let x = doc.x;
    let y = doc.y;
    doc.text("Coordinator, CSRC",x,y+50);
    doc.text("Associate Dean, CSRC",x+387,y+50);
    doc.text("HOD",x+387,y);
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  generateReport,
};