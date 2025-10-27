import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/lib/formData';
import { SubmitCustomsRequest, SubmitCustomsResponse, SubmitCustomsError } from '@/types/customs-api';
import { automateCustomsSubmission as runAutomation } from '@/lib/customs-automation';
import { logger, ErrorCode } from '@/lib/logger';

// Validation functions with detailed error reporting
function validateFormData(formData: unknown): { valid: boolean; missingFields?: string[] } {
  if (!formData || typeof formData !== 'object') {
    return { valid: false, missingFields: ['formData object'] };
  }

  // Cast to record for field access
  const data = formData as Record<string, unknown>;
  const missingFields: string[] = [];

  // Check required fields for All Indonesia form
  const requiredFields = [
    'passportNumber',
    'fullPassportName',
    'nationality',
    'dateOfBirth',
    'countryOfBirth',
    'gender',
    'passportExpiryDate',
    'mobileNumber',
    'email',
    'arrivalDate',
    'departureDate',
    'modeOfTransport',
    'purposeOfTravel',
    'addressInIndonesia',
    'placeOfArrival',
    'baggageCount'
  ];

  for (const field of requiredFields) {
    // Special handling for gender which can be null but must be present
    if (field === 'gender') {
      if (!('gender' in data)) {
        missingFields.push(field);
      }
    } else if (!data[field] || data[field]?.toString().trim() === '') {
      missingFields.push(field);
    }
  }
  
  // Check conditional fields based on transport mode
  if (data.modeOfTransport === 'AIR') {
    if (!data.flightName || !data.flightName.toString().trim()) {
      missingFields.push('flightName');
    }
    if (!data.flightNumber || !data.flightNumber.toString().trim()) {
      missingFields.push('flightNumber');
    }
  } else if (data.modeOfTransport === 'SEA') {
    if (!data.vesselName || !data.vesselName.toString().trim()) {
      missingFields.push('vesselName');
    }
    if (!data.typeOfVessel || !data.typeOfVessel.toString().trim()) {
      missingFields.push('typeOfVessel');
    }
  }

  // Validate customs declaration fields
  if (data.hasGoodsToDeclarate === null || data.hasGoodsToDeclarate === undefined) {
    missingFields.push('hasGoodsToDeclarate');
  }

  if (data.hasTechnologyDevices === null || data.hasTechnologyDevices === undefined) {
    missingFields.push('hasTechnologyDevices');
  }

  if (!data.consentAccurate) {
    missingFields.push('consentAccurate');
  }

  // Validate countries visited (required for health declaration)
  if (!Array.isArray(data.countriesVisited) || data.countriesVisited.length === 0) {
    missingFields.push('countriesVisited');
  }

  // Validate family members array structure
  if (!Array.isArray(data.familyMembers)) {
    missingFields.push('familyMembers (must be array)');
  }

  // If declaring goods, validate goods array
  if (data.hasGoodsToDeclarate && !Array.isArray(data.declaredGoods)) {
    missingFields.push('declaredGoods (must be array when hasGoodsToDeclarate is true)');
  }

  return { valid: missingFields.length === 0, missingFields };
}

function shouldRedirectToManualSubmission(formData: FormData): { shouldRedirect: boolean; reason?: string } {
  // Check for government flight
  if (formData.typeOfAirTransport === 'GOVERNMENT FLIGHT') {
    return { shouldRedirect: true, reason: 'Government flight selected' };
  }
  
  // Check for goods to declare
  if (formData.hasGoodsToDeclarate === true) {
    return { shouldRedirect: true, reason: 'Has goods to declare' };
  }
  
  // Check for health symptoms
  if (formData.hasSymptoms === true) {
    return { shouldRedirect: true, reason: 'Has health symptoms' };
  }
  
  return { shouldRedirect: false };
}

function createErrorResponse(
  code: string, 
  message: string, 
  step?: 'validation' | 'navigation' | 'form_fill' | 'submission' | 'qr_extraction', 
  details?: unknown,
  fallbackUrl?: string
): NextResponse<SubmitCustomsError> {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
      step,
      details
    },
    fallbackUrl
  }, { status: 400 });
}

// Wrapper function to handle automation
async function automateCustomsSubmission(formData: FormData): Promise<SubmitCustomsResponse> {
  try {
    // Run the automation with the form data and performance optimizations
    const result = await runAutomation(formData, {
      headless: process.env.NODE_ENV === 'production',
      timeout: 45000, // Reduced timeout due to optimizations
      onProgress: (update) => {
        // Progress updates can be logged for monitoring
        console.log(`📊 Progress: ${update.progress}% - ${update.step}: ${update.message}`);
        // Note: In future, this could be sent via WebSockets or Server-Sent Events
      }
    });
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Automation failed';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : error;
    
    // Enhanced logging for monitoring
    logger.error(
      ErrorCode.API_ERROR,
      '🤖 Automation execution failed',
      {
        error_code: 'AUTOMATION_FAILED',
        error_message: errorMessage,
        error_step: 'submission',
        form_data_summary: {
          passport: formData.passportNumber,
          port: formData.placeOfArrival,
          arrival_date: formData.arrivalDate,
          has_goods: formData.hasGoodsToDeclarate,
          family_members: formData.familyMembers.length
        },
        error_details: errorDetails
      },
      error instanceof Error ? error : undefined
    );
    
    console.error('🤖 Automation failed:', errorMessage);
    
    return {
      success: false,
      error: {
        code: 'AUTOMATION_FAILED',
        message: errorMessage,
        step: 'submission',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      fallbackUrl: 'https://allindonesia.imigrasi.go.id/'
    };
  }
}

export async function POST(request: NextRequest) {
  const requestTimer = logger.startTimer('API Request Processing');
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info('API_REQUEST_RECEIVED', '🚀 Customs submission API called', {
    requestId,
    method: 'POST',
    url: request.url,
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent')
    }
  });
  
  console.log('🚀 Customs submission API called');
  
  try {
    // Parse request body
    let body: SubmitCustomsRequest;
    try {
      body = await request.json();
      logger.debug('REQUEST_BODY_PARSED', 'Successfully parsed request body', { requestId });
    } catch (parseError) {
      logger.error(
        ErrorCode.API_ERROR,
        'Failed to parse request body',
        { requestId, error: parseError instanceof Error ? parseError.message : 'Unknown error' },
        parseError instanceof Error ? parseError : undefined
      );
      console.error('Failed to parse request body:', parseError);
      return createErrorResponse(
        'INVALID_JSON',
        'Invalid JSON in request body',
        'validation',
        parseError
      );
    }

    // Validate request structure
    if (!body.formData) {
      return createErrorResponse(
        'MISSING_FORM_DATA',
        'Form data is required',
        'validation'
      );
    }

    // Validate form data
    const validation = validateFormData(body.formData);
    if (!validation.valid) {
      logger.warn('VALIDATION_FAILED', 'Form data validation failed', {
        requestId,
        passport: (body.formData as {passportNumber?: string})?.passportNumber || 'unknown',
        missingFields: validation.missingFields
      });
      console.log('❌ Validation failed. Missing fields:', validation.missingFields);
      return createErrorResponse(
        'INVALID_FORM_DATA',
        `Form data validation failed. Missing fields: ${validation.missingFields?.join(', ')}`,
        'validation',
        { missingFields: validation.missingFields }
      );
    }

    logger.info('VALIDATION_PASSED', '✅ Form data validation passed', {
      requestId,
      passport: body.formData.passportNumber,
      arrivalPort: body.formData.placeOfArrival,
      arrivalDate: body.formData.arrivalDate,
      familyMembers: body.formData.familyMembers.length,
      hasGoods: body.formData.hasGoodsToDeclarate
    });

    console.log('✅ Form data validation passed');
    console.log(`📝 Processing customs submission for passport: ${body.formData.passportNumber}`);
    console.log(`✈️  Arrival: ${body.formData.placeOfArrival} on ${body.formData.arrivalDate}`);
    console.log(`👨‍👩‍👧‍👦 Family members: ${body.formData.familyMembers.length}`);
    console.log(`📦 Declaring goods: ${body.formData.hasGoodsToDeclarate ? 'Yes' : 'No'}`);

    // Check if user should be redirected to manual submission
    const redirectCheck = shouldRedirectToManualSubmission(body.formData);
    if (redirectCheck.shouldRedirect) {
      logger.info('MANUAL_SUBMISSION_REDIRECT', '🔄 Redirecting to manual submission', {
        requestId,
        passport: body.formData.passportNumber,
        reason: redirectCheck.reason
      });
      
      console.log(`🔄 Redirecting to manual submission: ${redirectCheck.reason}`);
      
      const totalDuration = requestTimer();
      logger.logApiResponse(false, totalDuration, { code: 'MANUAL_SUBMISSION_REQUIRED', message: redirectCheck.reason });
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'MANUAL_SUBMISSION_REQUIRED',
          message: `Manual submission required: ${redirectCheck.reason}`,
          step: 'validation'
        },
        fallbackUrl: 'https://allindonesia.imigrasi.go.id/'
      }, { status: 400 });
    }

    // Process customs submission
    const automationTimer = logger.startTimer('Automation Processing');
    const result = await automateCustomsSubmission(body.formData);
    const automationDuration = automationTimer();
    
    if (result.success) {
      logger.info('AUTOMATION_SUCCESS', '✅ Customs submission completed successfully', {
        requestId,
        passport: body.formData.passportNumber,
        duration: automationDuration,
        submissionId: result.submissionDetails?.submissionId
      });
      console.log('✅ Customs submission completed successfully');
      
      const totalDuration = requestTimer();
      logger.logApiResponse(true, totalDuration);
      
      return NextResponse.json(result);
    } else {
      logger.error(
        ErrorCode.API_ERROR,
        `❌ Customs submission failed: ${result.error.message}`,
        {
          requestId,
          passport: body.formData.passportNumber,
          duration: automationDuration,
          errorCode: result.error.code,
          errorStep: result.error.step
        }
      );
      console.log('❌ Customs submission failed:', result.error.message);
      
      const totalDuration = requestTimer();
      logger.logApiResponse(false, totalDuration, result.error);
      
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    const totalDuration = requestTimer();
    
    logger.error(
      ErrorCode.API_ERROR,
      '💥 Unexpected error in customs submission',
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      error instanceof Error ? error : undefined
    );
    
    console.error('💥 Unexpected error in customs submission:', error);
    
    logger.logApiResponse(false, totalDuration, error);
    
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred while processing your customs submission',
      undefined,
      process.env.NODE_ENV === 'development' ? error : undefined,
      'https://allindonesia.imigrasi.go.id/'
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Indonesian Customs Automation API is ready',
    version: '1.0.0',
    endpoints: {
      submit: 'POST /api/submit-customs'
    },
    timestamp: new Date().toISOString()
  });
}