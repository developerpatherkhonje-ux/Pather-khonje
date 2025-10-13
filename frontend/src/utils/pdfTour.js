import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateUtils';

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

const tourTerms = [
    '1. Tour itinerary may change due to weather conditions or unforeseen circumstances',
    '2. All passengers must carry valid ID proof during travel',
    '3. Package cost includes mentioned services only',
    '4. Cancellation charges as per company policy will apply',
    '5. Company is not responsible for any loss of personal belongings'
];

export async function generateTourInvoicePdf(invoice, fileName = 'tour_invoice') {
    try {
        // Debug: Log the invoice data structure
        console.log('Tour PDF - Invoice data:', invoice);
        console.log('Tour PDF - Tour Details:', invoice.tourDetails);
        console.log('Tour PDF - Transport Details:', invoice.transportDetails);
        console.log('Tour PDF - Transport Details modeOfTransport:', invoice.transportDetails?.modeOfTransport);
        console.log('Tour PDF - Transport Details fooding:', invoice.transportDetails?.fooding);
        console.log('Tour PDF - Transport Details pickupPoint:', invoice.transportDetails?.pickupPoint);
        console.log('Tour PDF - Transport Details dropPoint:', invoice.transportDetails?.dropPoint);
        console.log('Tour PDF - Transport Details includedTransportDetails:', invoice.transportDetails?.includedTransportDetails);
        console.log('Tour PDF - Hotels data:', invoice.hotels);
        console.log('Tour PDF - Hotels length:', invoice.hotels?.length || 0);
        
        // Create a temporary container for the invoice
        const invoiceContainer = document.createElement('div');
        invoiceContainer.style.position = 'absolute';
        invoiceContainer.style.left = '-9999px';
        invoiceContainer.style.width = '794px'; // A4 width at 96 DPI
        invoiceContainer.style.backgroundColor = 'white';
        invoiceContainer.style.padding = '40px';
        invoiceContainer.style.fontFamily = 'Arial, sans-serif';
        
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
                    <div style="display: flex; align-items: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px;">
                        ${logoDataURL ? `<div style="margin-right: 20px;">
                            <img src="${logoDataURL}" style="width: 100px; height: 100px;" alt="Company Logo" />
                        </div>` : ''}
                        <div style="flex: 1;">
                            <h1 style="color: #16a34a; font-size: 36px; margin: 0; font-weight: bold;">${companyInfo.name}</h1>
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
                            <h2 style="color: #16a34a; font-size: 24px; margin: 0;">
                                Tour Package Invoice
                            </h2>
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Invoice #${invoice.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${formatDate(invoice.date || new Date())}</p>
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
                        </div>
                    </div>

                    ${generateTourPackageDetails(invoice)}
                    ${generateHotelDetails(invoice)}
                    ${generateTransportDetails(invoice)}

                    <!-- Payment Summary -->
                    <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Payment Summary</h3>
                        ${generateTourPaymentSummary(invoice)}
                    </div>

                    <!-- Terms and Conditions -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">Terms and Conditions:</h3>
                        <div style="font-size: 12px; color: #666; line-height: 1.5;">
                            ${tourTerms.map(term => `<div style="margin-bottom: 5px;">${term}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 2px solid #bbf7d0; padding-top: 20px; margin-top: 40px;">
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

const generateTourPackageDetails = (invoice) => {
    if (invoice.tourDetails) {
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
                            <td style="border: 1px solid #86efac; padding: 8px;">${formatDate(invoice.tourDetails.startDate) || 'N/A'}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${formatDate(invoice.tourDetails.endDate) || 'N/A'}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${(() => {
                                const days = invoice.tourDetails.totalDays || invoice.tourDetails.days || 0;
                                if (days === 0 && invoice.tourDetails.startDate && invoice.tourDetails.endDate) {
                                    const start = new Date(invoice.tourDetails.startDate);
                                    const end = new Date(invoice.tourDetails.endDate);
                                    const diffTime = Math.abs(end - start);
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays;
                                }
                                return days;
                            })()}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${invoice.tourDetails.pax || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${invoice.tourDetails.inclusions ? `
                    <div style="margin-top: 15px;">
                        <strong>Inclusions:</strong><br>
                        <div style="font-size: 12px; color: #666; line-height: 1.5; margin-top: 5px;">
                            ${invoice.tourDetails.inclusions}
                        </div>
                    </div>
                ` : ''}
                
                ${invoice.tourDetails.exclusions ? `
                    <div style="margin-top: 15px;">
                        <strong>Exclusions:</strong><br>
                        <div style="font-size: 12px; color: #666; line-height: 1.5; margin-top: 5px;">
                            ${invoice.tourDetails.exclusions}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    return '';
};

const generateHotelDetails = (invoice) => {
    // Check multiple possible locations for hotel data
    const hotels = Array.isArray(invoice.hotels) ? invoice.hotels : 
                  Array.isArray(invoice.tourDetails?.hotels) ? invoice.tourDetails.hotels : [];
    
    console.log('generateHotelDetails - invoice.hotels:', invoice.hotels);
    console.log('generateHotelDetails - invoice.tourDetails?.hotels:', invoice.tourDetails?.hotels);
    console.log('generateHotelDetails - hotels array:', hotels);
    console.log('generateHotelDetails - hotels.length:', hotels.length);
    
    if (hotels.length > 0) {
        return `
            <!-- Hotel Details -->
            <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Hotel Details</h3>
                
                <!-- Hotel Details Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #dcfce7;">
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Hotel Name</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Place</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Check-in</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Check-out</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Room Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hotels.map(hotel => `
                            <tr>
                                <td style="border: 1px solid #86efac; padding: 8px;">${hotel.hotelName || hotel.name || 'N/A'}</td>
                                <td style="border: 1px solid #86efac; padding: 8px;">${hotel.place || 'N/A'}</td>
                                <td style="border: 1px solid #86efac; padding: 8px;">${formatDate(hotel.checkIn) || 'N/A'}</td>
                                <td style="border: 1px solid #86efac; padding: 8px;">${formatDate(hotel.checkOut) || 'N/A'}</td>
                                <td style="border: 1px solid #86efac; padding: 8px;">${hotel.roomType || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        console.log('generateHotelDetails - No hotels found, returning empty string');
        return `
            <!-- Hotel Details -->
            <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Hotel Details</h3>
                <div style="text-align: center; color: #666; font-style: italic; padding: 20px;">
                    No hotel details available
                </div>
            </div>
        `;
    }
};

const generateTransportDetails = (invoice) => {
    if (invoice.transportDetails) {
        return `
            <!-- Transport Details -->
            <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Other Details</h3>
                
                <!-- Transport Details Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #dcfce7;">
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Transport</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Fooding</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Pickup</th>
                            <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Drop</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #86efac; padding: 8px;">${(() => {
                                const transport = invoice.transportDetails?.modeOfTransport || invoice.tourDetails?.modeOfTransport || invoice.tourDetails?.transport || '';
                                console.log('PDF - Transport value:', transport);
                                return transport || 'N/A';
                            })()}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${(() => {
                                const fooding = invoice.transportDetails?.fooding || invoice.tourDetails?.fooding || '';
                                console.log('PDF - Fooding value:', fooding);
                                return fooding || 'N/A';
                            })()}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${(() => {
                                const pickup = invoice.transportDetails?.pickupPoint || invoice.tourDetails?.pickupPoint || invoice.tourDetails?.pickup || '';
                                console.log('PDF - Pickup value:', pickup);
                                return pickup || 'N/A';
                            })()}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${(() => {
                                const drop = invoice.transportDetails?.dropPoint || invoice.tourDetails?.dropPoint || invoice.tourDetails?.drop || '';
                                console.log('PDF - Drop value:', drop);
                                return drop || 'N/A';
                            })()}</td>
                        </tr>
                    </tbody>
                </table>
                
                 <!-- Included Transport Details Row -->
                 ${(() => {
                     const includedDetails = invoice.transportDetails?.includedTransportDetails || invoice.tourDetails?.includedTransportDetails || '';
                     console.log('PDF - Included Transport Details:', includedDetails);
                     if (includedDetails && includedDetails.trim() !== '') {
                         return `
                             <div style="margin-top: 15px; width: 100%; overflow: hidden;">
                                 <div style="display: flex; align-items: flex-start; gap: 10px; width: 100%;">
                                     <div style="font-weight: 600; color: #166534; min-width: 180px; flex-shrink: 0;">Included Transport Details:</div>
                                     <div style="color: #374151; flex: 1; max-width: calc(100% - 200px); word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.4;">${includedDetails}</div>
                                 </div>
                             </div>
                         `;
                     }
                     return '';
                 })()}
            </div>
        `;
    }
    return '';
};

const generateTourPaymentSummary = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const gstAmount = invoice.tax || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    // Calculate adult and child totals
    let adultPrice = Number(invoice.tourDetails?.adultPrice || 0);
    let childPrice = Number(invoice.tourDetails?.childPrice || 0);
    let adults = Number(invoice.tourDetails?.adults || 0);
    let children = Number(invoice.tourDetails?.children || 0);
    
    // If individual prices are missing but we have subtotal, try to calculate them
    if ((adultPrice === 0 && childPrice === 0) && subtotal > 0) {
        // For existing invoices without individual pricing, show the subtotal directly
        adults = 1;
        children = 0;
        adultPrice = subtotal;
        childPrice = 0;
    }
    
    const adultTotal = adultPrice * adults;
    const childTotal = childPrice * children;
    
    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: #dcfce7;">
                    <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Description</th>
                    <th style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #166534;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Adult Price (₹${adultPrice.toLocaleString('en-IN')} × ${adults})</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${adultTotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Child Price (₹${childPrice.toLocaleString('en-IN')} × ${children})</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${childTotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Subtotal</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">GST (${invoice.gstPercent || 0}%)</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${gstAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Discount</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #dc2626;">-₹${discount.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: #f0fdf4; font-weight: bold;">
                    <td style="border: 1px solid #86efac; padding: 8px;">Total Amount</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Advance Paid</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #16a34a;">₹${advancePaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: #fef3c7; font-weight: bold;">
                    <td style="border: 1px solid #86efac; padding: 8px;">Due Amount</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #ea580c;">₹${dueAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Payment Method</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">${invoice.paymentMethod || 'Cash'}</td>
                </tr>
            </tbody>
        </table>
    `;
};
