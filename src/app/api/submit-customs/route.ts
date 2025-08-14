import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/lib/formData';
import { SubmitCustomsRequest, SubmitCustomsResponse, SubmitCustomsError } from '@/types/customs-api';
import { automateCustomsSubmission as runAutomation } from '@/lib/customs-automation';
import { logger, ErrorCode } from '@/lib/logger';

// Validation functions
function validateFormData(formData: unknown): formData is FormData {
  if (!formData || typeof formData !== 'object') {
    return false;
  }

  // Cast to record for field access
  const data = formData as Record<string, unknown>;

  // Check required fields
  const requiredFields = [
    'passportNumber',
    'portOfArrival', 
    'arrivalDate',
    'fullPassportName',
    'dateOfBirth',
    'flightVesselNumber',
    'nationality',
    'addressInIndonesia',
    'numberOfLuggage'
  ];

  for (const field of requiredFields) {
    if (!data[field] || data[field]?.toString().trim() === '') {
      return false;
    }
  }

  // Validate customs declaration fields
  if (data.hasGoodsToDeclarate === null || data.hasGoodsToDeclarate === undefined) {
    return false;
  }

  if (data.hasTechnologyDevices === null || data.hasTechnologyDevices === undefined) {
    return false;
  }

  if (!data.consentAccurate) {
    return false;
  }

  // Validate family members array structure
  if (!Array.isArray(data.familyMembers)) {
    return false;
  }

  // If declaring goods, validate goods array
  if (data.hasGoodsToDeclarate && !Array.isArray(data.declaredGoods)) {
    return false;
  }

  return true;
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
    console.error('Automation failed:', error);
    
    return {
      success: false,
      error: {
        code: 'AUTOMATION_FAILED',
        message: error instanceof Error ? error.message : 'Automation failed',
        step: 'submission',
        details: error
      },
      fallbackUrl: 'https://ecd.beacukai.go.id/'
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
    if (!validateFormData(body.formData)) {
      logger.warn('VALIDATION_FAILED', 'Form data validation failed', {
        requestId,
        passport: (body.formData as {passportNumber?: string})?.passportNumber || 'unknown'
      });
      return createErrorResponse(
        'INVALID_FORM_DATA',
        'Form data validation failed. Please ensure all required fields are completed.',
        'validation'
      );
    }

    logger.info('VALIDATION_PASSED', '✅ Form data validation passed', {
      requestId,
      passport: body.formData.passportNumber,
      arrivalPort: body.formData.portOfArrival,
      arrivalDate: body.formData.arrivalDate,
      familyMembers: body.formData.familyMembers.length,
      hasGoods: body.formData.hasGoodsToDeclarate
    });

    console.log('✅ Form data validation passed');
    console.log(`📝 Processing customs submission for passport: ${body.formData.passportNumber}`);
    console.log(`✈️  Arrival: ${body.formData.portOfArrival} on ${body.formData.arrivalDate}`);
    console.log(`👨‍👩‍👧‍👦 Family members: ${body.formData.familyMembers.length}`);
    console.log(`📦 Declaring goods: ${body.formData.hasGoodsToDeclarate ? 'Yes' : 'No'}`);

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
      'https://ecd.beacukai.go.id/'
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