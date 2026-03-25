## ADDED Requirements

### Requirement: User can request an OTP for their phone number
The system SHALL accept a phone number and generate a 6-digit OTP. If the phone exists in `PhoneConfig`, the OTP SHALL be the configured `defaultOtp` (default `999999`). Otherwise a random 6-digit OTP SHALL be generated. The OTP SHALL be hashed and stored in `OtpVerification` with a 5-minute expiry. Any previous unverified OTP for the same phone SHALL be deleted before storing the new one. The raw OTP SHALL NOT appear in the API response.

#### Scenario: Request OTP for whitelisted phone
- **WHEN** `POST /auth/otp/request` is called with a phone that exists in `PhoneConfig`
- **THEN** the system stores a hashed OTP derived from `PhoneConfig.defaultOtp` with 5-minute expiry and returns `200 OK`

#### Scenario: Request OTP for non-whitelisted phone
- **WHEN** `POST /auth/otp/request` is called with a phone not in `PhoneConfig`
- **THEN** the system generates a random 6-digit OTP, hashes and stores it with 5-minute expiry, and returns `200 OK`

#### Scenario: Previous OTP is replaced on new request
- **WHEN** `POST /auth/otp/request` is called for a phone that already has a pending OTP
- **THEN** the old `OtpVerification` record is deleted and a new one is created

#### Scenario: OTP is never returned in the response
- **WHEN** `POST /auth/otp/request` succeeds
- **THEN** the response body SHALL NOT contain the OTP value

### Requirement: System validates OTP and issues appropriate response
The system SHALL verify the submitted OTP against the stored hash for the given phone. If the OTP is expired, the attempt counter SHALL NOT be incremented and a `400` error SHALL be returned. If the OTP is wrong, the attempt counter SHALL be incremented. If attempts reach 3, further attempts SHALL be rejected without hash comparison. On successful verification the `OtpVerification` record SHALL be deleted (no replay). The system SHALL then check if a `User` with that phone exists and respond accordingly.

#### Scenario: Correct OTP for existing user
- **WHEN** `POST /auth/otp/verify` is called with a valid, unexpired OTP for a phone that belongs to an existing user
- **THEN** the `OtpVerification` record is deleted and the response contains `accessToken` and `refreshToken`

#### Scenario: Correct OTP for new user
- **WHEN** `POST /auth/otp/verify` is called with a valid, unexpired OTP for a phone with no associated user
- **THEN** the `OtpVerification` record is deleted and the response contains a short-lived `registrationToken` (5-minute JWT proving phone ownership) with no access or refresh tokens

#### Scenario: Wrong OTP increments attempts
- **WHEN** `POST /auth/otp/verify` is called with an incorrect OTP and attempts < 3
- **THEN** the system increments `OtpVerification.attempts` and returns `400 Bad Request`

#### Scenario: OTP blocked after 3 failed attempts
- **WHEN** `POST /auth/otp/verify` is called and `OtpVerification.attempts` is already 3
- **THEN** the system returns `400 Bad Request` without comparing the OTP hash

#### Scenario: Expired OTP is rejected
- **WHEN** `POST /auth/otp/verify` is called after the OTP's `expiresAt` has passed
- **THEN** the system returns `400 Bad Request` without incrementing attempts

#### Scenario: OTP cannot be reused after success
- **WHEN** `POST /auth/otp/verify` is called a second time with the same (previously correct) OTP
- **THEN** the system returns `400 Bad Request` (record was deleted on first success)

### Requirement: PhoneConfig controls default OTP assignment
The system SHALL maintain a `PhoneConfig` table. Any phone number successfully completing registration SHALL be automatically inserted into `PhoneConfig` with `defaultOtp = '999999'`. Entries can be removed to force real OTP flow for that phone.

#### Scenario: Registered phone is auto-added to PhoneConfig
- **WHEN** a new user completes registration
- **THEN** their phone is inserted into `PhoneConfig` with `defaultOtp = '999999'` if not already present

#### Scenario: Removing phone from PhoneConfig disables bypass
- **WHEN** a phone's entry is deleted from `PhoneConfig`
- **THEN** `POST /auth/otp/request` generates a random OTP for that phone instead of `999999`
