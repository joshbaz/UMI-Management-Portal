# Nodemailer Setup Guide

This guide will help you set up Nodemailer to send emails with attachments from your UMI Management application.

## Overview

The application now uses Nodemailer on the backend to send emails with Excel attachments. This provides better control, reliability, and security compared to frontend-only solutions.

## Backend Setup (umi-server)

### 1. Environment Variables

Make sure your `.env` file in the `umi-server` directory contains the following email configuration:

```env
# Email Configuration
NODE_MAILER_USERCRED=your-email@gmail.com
NODE_MAILER_PASSCRED=your-app-password
```

### 2. Gmail App Password Setup

If using Gmail, you'll need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App passwords
5. Generate a new app password for "Mail"
6. Use this password in `NODE_MAILER_PASSCRED`

### 3. Alternative Email Providers

You can use other email providers by modifying the email service configuration in `src/services/emailService.js`:

```javascript
// For Outlook/Hotmail
this.transporter = nodemailer.createTransporter({
    service: 'outlook',
    auth: {
        user: process.env.NODE_MAILER_USERCRED,
        pass: process.env.NODE_MAILER_PASSCRED,
    },
});

// For custom SMTP
this.transporter = nodemailer.createTransporter({
    host: 'your-smtp-host.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODE_MAILER_USERCRED,
        pass: process.env.NODE_MAILER_PASSCRED,
    },
});
```

## Backend Services

### Email Service (`src/services/emailService.js`)
- Handles email sending with Nodemailer
- Professional HTML email templates
- Excel attachment support
- Connection testing

### Management Controller (`src/api/v1/controllers/managementController.js`)
- Contains existing `updateResultsSentDate` function
- Handles student status updates and database operations
- Includes activity logging and validation
- Reused by email controller for consistency

## API Endpoints

### Send Results Email
- **URL**: `POST /api/v1/email/send-results`
- **Description**: Sends results email with Excel attachment and updates student status
- **Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Results for School Name - 2024",
  "message": "Please find attached the results...",
  "schoolName": "School Name",
  "academicYear": "2024",
  "studentCount": 25,
  "excelBuffer": "base64-encoded-excel-file",
  "fileName": "School_Results_2024.xlsx",
  "studentIds": ["student-id-1", "student-id-2"]
}
```

### Test Email Connection
- **URL**: `GET /api/v1/email/test-connection`
- **Description**: Tests the email service connection

## Frontend Integration

The frontend automatically sends requests to the backend API when users click "Send to School" in the "Results Approved at Centre" tab.

### Features:
- ✅ Excel file generation with proper formatting
- ✅ Professional HTML email templates
- ✅ Automatic database updates after successful email sending
- ✅ Student status management
- ✅ Error handling and user feedback
- ✅ Support for multiple recipients

## Database Updates

When an email is successfully sent, the system automatically:

1. **Updates Student Records**: Sets `resultsSentDate` for all students in the school
2. **Manages Student Status**: Transitions students to "results sent to schools" status
3. **Maintains Audit Trail**: All changes are properly tracked in the database

## Testing the Integration

### 1. Test Email Connection
```bash
curl -X GET http://localhost:3000/api/v1/email/test-connection
```

### 2. Test Email Sending
1. Start both frontend and backend servers
2. Go to "Results Approved at Centre" tab
3. Click "Send to School" for any school
4. Fill in email details and send
5. Check if the email is received with the Excel attachment
6. Verify that student statuses are updated in the database

## Email Template

The system uses a professional HTML email template that includes:

- UMI branding and colors
- School information
- Academic year details
- Student count
- Attachment information
- Professional footer

## Error Handling

The system includes comprehensive error handling:

- **Connection Errors**: Email service connection issues
- **Authentication Errors**: Invalid email credentials
- **File Size Limits**: Large Excel file handling
- **Network Errors**: API communication issues
- **Database Errors**: Student status update failures
- **Validation Errors**: Missing required fields

## Security Considerations

- ✅ Email credentials stored in environment variables
- ✅ No sensitive data exposed in frontend
- ✅ Input validation on both frontend and backend
- ✅ Error messages don't expose sensitive information
- ✅ Database operations are secure and validated
- ✅ Rate limiting can be added to prevent abuse

## Troubleshooting

### Common Issues:

1. **"Email service connection failed"**
   - Check your email credentials in `.env`
   - Verify Gmail App Password is correct
   - Ensure 2-Step Verification is enabled for Gmail

2. **"Failed to send email"**
   - Check email provider settings
   - Verify recipient email addresses
   - Check server logs for detailed error messages

3. **"Missing required fields"**
   - Ensure all required fields are provided
   - Check frontend form validation

4. **"Student not found"**
   - Verify student IDs are correct
   - Check database connectivity

5. **Large file issues**
   - Excel files are automatically optimized
   - Consider splitting very large datasets

### Debug Mode

Enable debug logging by adding to your server startup:

```javascript
// In your server startup code
emailService.testConnection().then(isConnected => {
    console.log('Email service status:', isConnected ? 'Connected' : 'Failed');
});
```

## Performance Optimization

- Excel files are generated efficiently using the XLSX library
- Base64 encoding is handled on the backend
- Email sending is asynchronous
- Database updates are batched for efficiency
- Prisma optimizes database queries

## Database Schema Requirements

The system requires the following database tables and relationships:

- **Student**: Contains `resultsSentDate`, `resultsApprovedDate`, `senateApprovalDate` fields
- **StudentStatus**: Tracks student status changes with `isCurrent` flag
- **StatusDefinition**: Contains status definitions like "results sent to schools"

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify email provider settings
3. Test email connection using the API endpoint
4. Review this setup guide for configuration details
5. Check database connectivity and schema 