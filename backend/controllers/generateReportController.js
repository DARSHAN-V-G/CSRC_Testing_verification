const PDFDocument = require("pdfkit");
const reportSchema = require("../models/TestModel");

function formatCurrency(num) {
    return Number(num).toFixed(2);
}

const generateReport = async (req, res) => {
  try {
    const ref_no = req.params.ref_no;
    if (!ref_no) {
      return res.status(400).json({
        message: "Reference Number is required",
      });
    }
    const report = await reportSchema.findOne({ ref_no: ref_no });
    if (!report) return res.status(404).json({ message: "Report not found" });

    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=report_${report.ref_no}.pdf`);
    doc.pipe(res);

    // Header Section
    doc.y = doc.y-25
    doc.fontSize(16).font('Helvetica-Bold').text('PSG COLLEGE OF TECHNOLOGY - 641 004', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Phone: 0422-4344777 Extn : 4448', { align: 'center' });
    doc.moveDown();
    
    // Department (right aligned)
    doc.fontSize(12).text(`DEPARTMENT: ${report.department}`, { align: 'left' });
    doc.moveDown();

    // Testing/Consultancy Details (centered and underlined)
    const consultancyText = 'Testing/Consultancy Details';
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
      .text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, doc.x + 425, refDate);
    doc.moveDown(0.5);

    // Client Details Table with vertical lines
    const clientDetails = [
      ['Client\'s Name', report.client_name],
      ['Client Letter/PO No.', report.client_po_no],
      ['Client Letter / PO received on', new Date(report.client_po_recieved_date).toLocaleDateString()],
      ['Bill to be sent to : ',report.bill_to_be_sent_mail_address],
      ['GST No.', report.gst_no]
    ];

    let yPos = doc.y;
    const colWidth = 265;
    const tableWidth = colWidth * 2;
    const tableHeight = clientDetails.length * 15;
    
    // Draw outer rectangle
    doc.rect(50, yPos, tableWidth, tableHeight).stroke();
    
    // Draw vertical line between columns
    doc.moveTo(colWidth-55, yPos).lineTo(colWidth-55, yPos + tableHeight).stroke();
    
    // Draw horizontal lines between rows
    clientDetails.forEach((_, index) => {
      if (index < clientDetails.length - 1) {
        doc.moveTo(50, yPos + (index + 1) * 15)
           .lineTo(50 + tableWidth, yPos + (index + 1) * 15)
           .stroke();
      }
    });
    
    // Add text
    clientDetails.forEach(([label, value], index) => {
      const rowY = yPos + (index * 15) + 3;
      doc.fontSize(11)
      .text(label, 55, rowY, { width: colWidth - 20 });
      doc.text(value,colWidth-50, rowY, { width: colWidth - 20 });
    });
    
    doc.moveDown(1);

    // Test Details Table
    const tableTop = doc.y;
    const tableHeaders = ['S.No', 'Particulars', 'Rate','Unit', 'Quantity', 'Amount'];
    const colWidths = [50, 200, 60,40, 80, 100];
    const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    let currentTop = tableTop;

    // Draw outer rectangle for test details table
    doc.rect(50, currentTop, totalTableWidth, 25).stroke();

    // Draw headers and vertical lines
    let xPos = 50;
    tableHeaders.forEach((header, i) => {
      doc.font('Helvetica-Bold').text(header, xPos + 5, currentTop + 7, { 
        width: colWidths[i] - 10,
        align: 'center'
      });
      
      // Draw vertical lines except for the last column
      if (i < tableHeaders.length - 1) {
        doc.moveTo(xPos + colWidths[i], currentTop)
           .lineTo(xPos + colWidths[i], currentTop + 25)
           .stroke();
      }
      xPos += colWidths[i];
    });

    currentTop += 25;
    let totalAmount = 0;

    // Draw rows
    report.test.forEach((item, index) => {
      const rowHeight = 20 * (Number(item.title.length/30) + 1);
      const amount = item.pricePerUnit * item.quantity;
      totalAmount += amount;

      // Draw row rectangle
      doc.rect(50, currentTop, totalTableWidth, rowHeight).stroke();

      // Draw vertical lines for each column
      xPos = 50;
      colWidths.forEach((width, i) => {
        if (i < colWidths.length - 1) {
          doc.moveTo(xPos + width, currentTop)
             .lineTo(xPos + width, currentTop + rowHeight)
             .stroke();
        }
        xPos += width;
      });

      // Add row content
      doc.font('Helvetica');
      doc.text((index + 1).toString(), 55, currentTop + 5, { width: colWidths[0] - 10, align: 'center' });
      doc.text(item.title, 105, currentTop + 5, { width: colWidths[1] - 10 });
      doc.text(formatCurrency(item.pricePerUnit), 305, currentTop + 5, { width: colWidths[2] - 15, align: 'right' });
      doc.text(item.unit,365,currentTop+5,{width: colWidth[3]-10,align:'right'}),
      doc.text(item.quantity.toString(), 405, currentTop + 5, { width: colWidths[4] - 10, align: 'center' });
      doc.text(formatCurrency(amount), 485, currentTop + 5, { width: colWidths[5] - 10, align: 'right' });

      currentTop += rowHeight;
    });

    // Subtotal row
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    doc.font('Helvetica-Bold')
      .text('Sub Total', 105, currentTop + 7, { width: colWidths[1] - 10 })
      .text(formatCurrency(totalAmount), 485, currentTop + 7, { width: colWidths[4] - 10, align: 'right' });

    // Draw vertical lines for subtotal row
    xPos = 50;
    colWidths.forEach((width, i) => {
      if (i < colWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 20)
           .stroke();
      }
      xPos += width;
    });

    currentTop += 20;

    // GST row
    const gstAmount = totalAmount * 0.18;
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    doc.font('Helvetica-Bold')
      .text('GST (18%)', 105, currentTop + 7, { width: colWidths[1] - 10 })
      .text(formatCurrency(gstAmount), 485, currentTop + 7, { width: colWidths[4] - 10, align: 'right' });

    // Draw vertical lines for GST row
    xPos = 50;
    colWidths.forEach((width, i) => {
      if (i < colWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 25)
           .stroke();
      }
      xPos += width;
    });

    currentTop += 20;

    // Grand Total row
    const grandTotal = totalAmount + gstAmount;
    doc.rect(50, currentTop, totalTableWidth, 20).stroke();
    doc.font('Helvetica-Bold')
      .text('Grand Total', 105, currentTop + 7, { width: colWidths[1] - 10 })
      .text(formatCurrency(grandTotal), 485, currentTop + 7, { width: colWidths[4] - 10, align: 'right' });

    // Draw vertical lines for grand total row
    xPos = 50;
    colWidths.forEach((width, i) => {
      if (i < colWidths.length - 1) {
        doc.moveTo(xPos + width, currentTop)
           .lineTo(xPos + width, currentTop + 20)
           .stroke();
      }
      xPos += width;
    });

    // Payment Details (right aligned)
    doc.x = 50;
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica')
      .text(`Payment Status: ${report.paid ? 'Paid' : 'Not Paid'}`, { align: 'left' })
      .text(`Mode of Payment: ${report.payment_mode}`, { align: 'left' })
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
    doc.text(`Transaction Details : ${report.transaction_details}`, 60, specialTableY + 5, { 
      width: specialColWidth - 20,
      align: 'left'
    });
    doc.text(`Dated : ${new Date(report.transaction_date).toLocaleDateString()}`, 170 + specialColWidth + 5, specialTableY + 5, {
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
    console.log(doc.y,doc.x);
    doc.fontSize(12).font('Helvetica-Bold')
      .text(`Prepared by : ${report.prepared_by}`);
    let xrect = doc.x
    let yrect = doc.y+10
    let columnwidth = 264
    doc.rect(xrect,yrect,2*columnwidth,35).stroke();
    doc.moveTo(xrect+120,yrect)
      .lineTo(xrect+120,yrect+35)
      .stroke();
    doc.moveTo(xrect+120+150,yrect)
      .lineTo(xrect+120+150,yrect+35)
      .stroke();
    doc.moveTo(xrect+120+150+100,yrect)
      .lineTo(xrect+120+150+100,yrect+35)
      .stroke();
    doc.font('Helvetica')
    .text("Receipt No & Date : ",xrect+5,yrect+12);
    doc.font('Helvetica')
    .text("Bill No & Date : ",xrect+5+270,yrect+12);
    doc.x = xrect;
    doc.y = yrect + 55;
    const flag = report.verified_flag;
    doc.text("Verified by :");
    const xflag = doc.x;
    const yflag = doc.y
    for(let i =0;i<flag+2;i++){
      doc.text(`${i+1}`);
    }
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  generateReport,
};