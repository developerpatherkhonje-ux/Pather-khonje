import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateUtils';

const loadImageAsBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imagePath;
    });
};

const companyInfo = {
    name: 'Pather Khonje',
    tagline: 'A tour that never seen before.',
    address: '64/2/12, Biren Roy Road (East),\nBehala Chowrasta, Kolkata - 700008',
    email: 'contact@patherkhonje.com',
    website: 'www.patherkhonje.com',
    phone: '+91 7439857694'
};

const hotelTerms = [
    '1. Check-in and check-out timings are as per the respective hotel\'s policy.',
    '2. Any damage to hotel property will be charged to the guest.',
    '3. Smoking is strictly prohibited inside the rooms.',
    '4. Outside food and alcoholic beverages are not allowed.',
    '5. Booking cancellation must be informed at least 48 hours in advance; refund will be as per company policy.',
    '6. Government-approved photo ID is mandatory at the time of check-in.',
    '7. Extra beds and room upgrades are subject to availability and additional charges.',
    '8. Early check-in or late check-out requests are subject to availability and may incur extra charges.',
    '9. Pets are not allowed unless specified by the hotel.',
    '10. The company is not responsible for any loss of personal belongings.'
];

export async function generateInvoicePdf(invoice, fileName = 'invoice') {
    try {
        if (!invoice.hotelDetails?.additionalBenefits) {
            invoice.hotelDetails = { ...invoice.hotelDetails, additionalBenefits: '' };
        }
        
        const invoiceContainer = document.createElement('div');
        invoiceContainer.style.position = 'absolute';
        invoiceContainer.style.left = '-9999px';
        invoiceContainer.style.width = '794px'; // A4 exact width
        invoiceContainer.style.backgroundColor = 'white';
        invoiceContainer.style.fontFamily = 'Arial, sans-serif';
        
        let logoDataURL = '';
        try { logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png'); } catch (e) {}
        
        invoiceContainer.innerHTML = `
            <!-- PAGE 1: INVOICE DETAILS -->
            <div style="height: 1122px; position: relative; box-sizing: border-box; display: flex; flex-direction: column;">
                
                <!-- Premium Header -->
                <div style="background-color: #0f172a; color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        ${logoDataURL ? `<div style="background: white; padding: 10px; border-radius: 8px;"><img src="${logoDataURL}" style="width: 80px; height: 80px; object-fit: contain;" /></div>` : ''}
                        <div>
                            <h1 style="margin: 0; font-size: 32px; color: #d4af37; font-family: Georgia, serif; letter-spacing: 1px;">${companyInfo.name}</h1>
                            <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic; color: #cbd5e1;">${companyInfo.tagline}</p>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        <div style="color: white; font-weight: bold; font-size: 14px; margin-bottom: 4px;">Corporate Office</div>
                        <div>${companyInfo.address.replace(/\n/g, '<br>')}</div>
                        <div>${companyInfo.phone} | ${companyInfo.email}</div>
                        <div style="color: #d4af37;">${companyInfo.website}</div>
                    </div>
                </div>

                <!-- Invoice Meta Bar -->
                <div style="background-color: #f8fafc; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-size: 24px; color: #0284c7; text-transform: uppercase; letter-spacing: 2px;">Hotel Invoice</h2>
                        <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-weight: bold;">INV-#${invoice.invoiceNumber || 'N/A'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Date Issued</div>
                        <div style="font-size: 16px; color: #0f172a; font-weight: bold;">${formatDate(invoice.date || new Date())}</div>
                    </div>
                </div>

                <div style="padding: 30px 40px; flex: 1;">
                    <!-- Bill To -->
                    <div style="margin-bottom: 25px;">
                        <div style="font-size: 12px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Billed To</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f1f5f9; padding: 15px; border-left: 4px solid #0284c7; border-radius: 4px; font-size: 14px;">
                            <div><strong style="color: #475569;">Name:</strong> <span style="color: #0f172a; font-weight: bold;">${invoice.customer?.name || 'N/A'}</span></div>
                            <div><strong style="color: #475569;">Phone:</strong> ${invoice.customer?.phone || 'N/A'}</div>
                            <div><strong style="color: #475569;">Email:</strong> ${invoice.customer?.email || 'N/A'}</div>
                            <div><strong style="color: #475569;">Address:</strong> ${invoice.customer?.address || 'N/A'}</div>
                        </div>
                    </div>

                    ${generateServiceDetails(invoice)}
                    ${generatePaymentSummary(invoice)}
                </div>

                <!-- Footer / Signatures -->
                <div style="padding: 0 40px 40px 40px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="font-size: 12px; color: #94a3b8;">
                        <p style="margin: 0;">Thank you for choosing Pather Khonje.</p>
                        <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} Pather Khonje. All rights reserved.</p>
                    </div>
                    <div style="text-align: center;">
                        <img src="/assets/stamp.png" alt="Company Stamp" style="width: 120px; height: 120px; opacity: 0.9;" />
                        <div style="margin-top: -30px; font-size: 12px; color: #0f172a; font-weight: bold; border-top: 1px solid #0f172a; padding-top: 4px; width: 160px;">Authorized Signatory</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 2: TERMS AND CONDITIONS -->
            <div style="height: 1122px; position: relative; box-sizing: border-box; background: #f8fafc; padding: 60px 40px;">
                <div style="border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase; letter-spacing: 2px;">Terms & Conditions</h2>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Please read these terms carefully before proceeding with your booking.</p>
                </div>
                
                <div style="font-size: 13px; color: #334155; line-height: 1.8; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    ${hotelTerms.map(term => `<div style="margin-bottom: 12px;">${term}</div>`).join('')}
                </div>

                ${logoDataURL ? `<div style="position: absolute; bottom: 60px; right: 40px; opacity: 0.1;"><img src="${logoDataURL}" style="width: 200px;" /></div>` : ''}
            </div>
        `;

        document.body.appendChild(invoiceContainer);

        const canvas = await html2canvas(invoiceContainer, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 297; // A4 height in mm
        
        // Add Page 1
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight * 2); // The image is 2 pages tall
        
        // Add Page 2
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -pageHeight, imgWidth, pageHeight * 2); // Shift image up by 1 page

        const safeFileName = (invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);
        document.body.removeChild(invoiceContainer);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}

const generateServiceDetails = (invoice) => {
    return `
        <div style="margin-bottom: 25px;">
            <div style="font-size: 12px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Booking Overview</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
                <thead>
                    <tr style="background: #0f172a; color: white;">
                        <th style="padding: 10px; text-align: left;">Hotel Name</th>
                        <th style="padding: 10px; text-align: left;">Place</th>
                        <th style="padding: 10px; text-align: center;">Check-In</th>
                        <th style="padding: 10px; text-align: center;">Check-Out</th>
                        <th style="padding: 10px; text-align: center;">Days/Nights</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0; background: white;">
                        <td style="padding: 12px 10px; font-weight: bold; color: #0f172a;">${invoice.hotelDetails.hotelName || 'N/A'}</td>
                        <td style="padding: 12px 10px;">${invoice.hotelDetails.place || invoice.hotelDetails.location || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center;">${formatDate(invoice.hotelDetails.checkIn) || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center;">${formatDate(invoice.hotelDetails.checkOut) || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center; font-weight: bold;">${invoice.hotelDetails.days || 0}D / ${invoice.hotelDetails.nights || 0}N</td>
                    </tr>
                </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f1f5f9; color: #475569;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Room Type</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">Rooms</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Price/Night</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">Pax (A/C)</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: white;">
                        <td style="padding: 12px 10px; border: 1px solid #e2e8f0;">${invoice.hotelDetails.roomType || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center; border: 1px solid #e2e8f0;">${invoice.hotelDetails.rooms || 0}</td>
                        <td style="padding: 12px 10px; text-align: right; border: 1px solid #e2e8f0;">₹${(invoice.hotelDetails.pricePerNight || 0).toLocaleString()}</td>
                        <td style="padding: 12px 10px; text-align: center; border: 1px solid #e2e8f0;">${invoice.hotelDetails.adults || 0}A / ${invoice.hotelDetails.children || 0}C</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #0f172a; border: 1px solid #e2e8f0;">₹${((invoice.hotelDetails.pricePerNight || 0) * (invoice.hotelDetails.rooms || 0) * (invoice.hotelDetails.nights || 0)).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #0284c7; font-size: 12px; display: block; margin-bottom: 4px;">Hotel Address:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.address || 'Not provided'}</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #0284c7; font-size: 12px; display: block; margin-bottom: 4px;">Additional Benefits:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.additionalBenefits || 'Not provided'}</div>
                </div>
            </div>
        </div>
    `;
};

const generatePaymentSummary = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    return `
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 350px;">
                <div style="font-size: 12px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Financial Summary</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tbody>
                        <tr>
                            <td style="padding: 8px 0; color: #475569;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #e2e8f0;">Discount</td>
                            <td style="padding: 8px 0; text-align: right; color: #dc2626; border-bottom: 1px solid #e2e8f0;">-₹${discount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #0f172a; font-weight: bold; font-size: 16px;">Total Amount</td>
                            <td style="padding: 12px 0; text-align: right; color: #0f172a; font-weight: bold; font-size: 16px;">₹${total.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #16a34a;">Advance Paid</td>
                            <td style="padding: 8px 0; text-align: right; color: #16a34a; font-weight: bold;">₹${advancePaid.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 15px; background: #0f172a; color: white; font-weight: bold; border-radius: 4px 0 0 4px; margin-top: 10px; display: inline-block;">DUE BALANCE</td>
                            <td style="padding: 12px 15px; background: #0f172a; color: #d4af37; font-weight: bold; text-align: right; border-radius: 0 4px 4px 0; margin-top: 10px;">₹${dueAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align: right; margin-top: 10px; font-size: 12px; color: #64748b;">Payment Method: <strong>${invoice.paymentMethod || 'N/A'}</strong></div>
            </div>
        </div>
    `;
};