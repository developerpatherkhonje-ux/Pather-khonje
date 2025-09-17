import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to load image as base64
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
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
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

const tourTerms = [
    '1. Tour itinerary may change due to weather conditions or unforeseen circumstances',
    '2. All passengers must carry valid ID proof during travel',
    '3. Package cost includes mentioned services only',
    '4. Cancellation charges as per company policy will apply',
    '5. Company is not responsible for any loss of personal belongings'
];

export async function generateInvoicePdf(invoice, fileName = 'invoice') {
    try {
        // Create a temporary container for the invoice
        const invoiceContainer = document.createElement('div');
        invoiceContainer.style.position = 'absolute';
        invoiceContainer.style.left = '-9999px';
        invoiceContainer.style.width = '794px'; // A4 width at 96 DPI
        invoiceContainer.style.backgroundColor = 'white';
        invoiceContainer.style.padding = '40px';
        invoiceContainer.style.fontFamily = 'Arial, sans-serif';
        
        const terms = invoice.type === 'hotel' ? hotelTerms : tourTerms;
        
        // Try to load logo
        let logoDataURL = '';
        try {
            logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png');
        } catch (logoError) {
            console.warn('Logo could not be loaded:', logoError);
        }
        
        invoiceContainer.innerHTML = `
            <div style="position: relative; min-height: 1000px;">
                <!-- Watermark -->
                ${logoDataURL ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.05; z-index: 0;">
                    <img src="${logoDataURL}" style="width: 300px; height: 300px;" alt="Watermark" />
                </div>` : ''}
                
                <!-- Content -->
                <div style="position: relative; z-index: 1;">
                    <!-- Header -->
                    <div style="display: flex; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
                        ${logoDataURL ? `<div style="margin-right: 20px;">
                            <img src="${logoDataURL}" style="width: 100px; height: 100px;" alt="Company Logo" />
                        </div>` : ''}
                        <div style="flex: 1;">
                            <h1 style="color: #2563eb; font-size: 36px; margin: 0; font-weight: bold;">${companyInfo.name}</h1>
                            <p style="color: #666; font-size: 16px; margin: 5px 0; font-style: italic;">${companyInfo.tagline}</p>
                            <div style="margin-top: 10px; font-size: 12px; color: #666; line-height: 1.4;">
                                <div>${companyInfo.address.replace(/\n/g, '<br>')}</div>
                                <div style="margin-top: 8px;">
                                    Email: ${companyInfo.email} | Website: ${companyInfo.website} | Phone: ${companyInfo.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Invoice Info -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <h2 style="color: ${invoice.type === 'hotel' ? '#2563eb' : '#16a34a'}; font-size: 24px; margin: 0;">
                                ${invoice.type === 'hotel' ? 'Hotel Booking Invoice' : 'Tour Package Invoice'}
                            </h2>
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Invoice #${invoice.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <!-- Customer Details -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Customer Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div><strong>Name :</strong> ${invoice.customer?.name || 'N/A'}</div>
                            <div><strong>Email :</strong> ${invoice.customer?.email || 'N/A'}</div>
                            <div><strong>Phone :</strong> ${invoice.customer?.phone || 'N/A'}</div>
                            <div><strong>Address :</strong> ${invoice.customer?.address || 'N/A'}</div>
                            <div><strong>Payment  Method :</strong> ${invoice.paymentMethod || 'N/A'}</div>
                        </div>
                    </div>

                    ${generateServiceDetails(invoice)}

                    <!-- Payment Summary -->
                    <div style="background: linear-gradient(to right, #eff6ff, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #dbeafe;">
                        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Payment Summary</h3>
                        ${generatePaymentSummary(invoice)}
                    </div>

                    <!-- Terms and Conditions -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">Terms and Conditions:</h3>
                        <div style="font-size: 12px; color: #666; line-height: 1.5;">
                            ${terms.map(term => `<div style="margin-bottom: 5px;">${term}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 2px solid #dbeafe; padding-top: 20px; margin-top: 40px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div style="text-align: left; padding-top: 20px;">
                                <div style="font-size: 12px; color: #666;">
                                    © 2018 - 2025 Pather Khonje. All rights reserved.
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="text-align: center;">
                                    <img src="/assets/stamp.png" alt="Company Stamp" style="width: 150px; height: 150px;" />
                                    <div style="margin-top: -50px;font-size: 12px; color: #666;">Authorized Signature & Stamp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(invoiceContainer);

        // Generate PDF
        const canvas = await html2canvas(invoiceContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const safeFileName = (invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);
        
        // Clean up
        document.body.removeChild(invoiceContainer);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
}

const generateServiceDetails = (invoice) => {
    if (invoice.type === 'hotel' && invoice.hotelDetails) {
        return `
            <!-- Hotel Details -->
            <div style="background: linear-gradient(to right, #eff6ff, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #dbeafe;">
                <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Hotel Booking Details</h3>
                
                <!-- Hotel Information Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                    <thead>
                        <tr style="background: #dbeafe;">
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Hotel Name</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Place</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">CheckIn</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">CheckOut</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Nights</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.hotelName || 'N/A'}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.place || invoice.hotelDetails.location || 'N/A'}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.checkIn ? new Date(invoice.hotelDetails.checkIn).toLocaleDateString() : 'N/A'}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.checkOut ? new Date(invoice.hotelDetails.checkOut).toLocaleDateString() : 'N/A'}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.nights || 0}</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Room Details Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #dbeafe;">
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Room Type</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Rooms</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Price/Night</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Adults</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Children</th>
                            <th style="border: 1px solid #93c5fd; padding: 8px; text-align: left; color: #1e40af;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.roomType || 'N/A'}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.rooms || 0}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">₹${(invoice.hotelDetails.pricePerNight || 0).toLocaleString()}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.adults || 0}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px;">${invoice.hotelDetails.children || 0}</td>
                            <td style="border: 1px solid #93c5fd; padding: 8px; font-weight: bold;">₹${((invoice.hotelDetails.pricePerNight || 0) * (invoice.hotelDetails.rooms || 0) * (invoice.hotelDetails.nights || 0)).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Hotel Address -->
                ${invoice.hotelDetails.address ? `
                    <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 5px; border-left: 4px solid #2563eb;">
                        <strong style="color: #374151; font-size: 14px;">Hotel Address:</strong><br>
                        <div style="font-size: 13px; color: #666; margin-top: 5px; line-height: 1.4;">
                            ${invoice.hotelDetails.address}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (invoice.type === 'tour' && invoice.tourDetails) {
        return `
            <!-- Tour Package Details -->
            <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Tour Package Details</h3>
                
                <!-- Package Overview Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                    <thead>
                        <tr style="background: #dcfce7;">
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Package Name</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Start Date</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">End Date</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Days</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Pax</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.packageName || 'N/A'}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.startDate ? new Date(invoice.tourDetails.startDate).toLocaleDateString() : 'N/A'}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.endDate ? new Date(invoice.tourDetails.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.days || 0}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.pax || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${invoice.tourDetails.inclusions ? `
                    <div style="margin-top: 15px;">
                        <strong>Inclusions:</strong><br>
                        <div style="font-size: 12px; color: #666; line-height: 1.5; margin-top: 5px;">
                            ${invoice.tourDetails.inclusions.split('\n').map(inclusion => `<div>• ${inclusion.trim()}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    return '';
};

const generatePaymentSummary = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    const isHotel = invoice.type === 'hotel';
    const headerColor = isHotel ? '#dbeafe' : '#dcfce7';
    const borderColor = isHotel ? '#93c5fd' : '#86efac';
    const textColor = isHotel ? '#1e40af' : '#166534';
    
    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: ${headerColor};">
                    <th style="border: 1px solid ${borderColor}; padding: 8px; text-align: left; color: ${textColor};">Description</th>
                    <th style="border: 1px solid ${borderColor}; padding: 8px; text-align: right; color: ${textColor};">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Subtotal</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Discount</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right; color: #dc2626;">-₹${discount.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: ${isHotel ? '#eff6ff' : '#f0fdf4'}; font-weight: bold;">
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Total Amount</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Advance Paid</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right; color: #16a34a;">₹${advancePaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: #fef3c7; font-weight: bold;">
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Due Amount</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right; color: #ea580c;">₹${dueAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid ${borderColor}; padding: 8px;">Payment Method</td>
                    <td style="border: 1px solid ${borderColor}; padding: 8px; text-align: right;">${invoice.paymentMethod || 'N/A'}</td>
                </tr>
            </tbody>
        </table>
    `;
};