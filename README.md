# ETL-InReach

<p align='center'>Garmin InReach or EverywhereHub Location data</p>

## Data Source

[Garmin InReach](https://www.garmin.com/en-NZ/c/outdoor-recreation/satellite-communicators/)

## Example Data

![Simulated device in Emergency mode](docs/etl-inreach.png)

### Configuration

#### Real Devices
Configure `INREACH_MAP_SHARES` with your Garmin InReach MapShare URLs:

```json
{
  "INREACH_MAP_SHARES": [
    {
      "ShareId": "your-share-id-or-url",
      "CallSign": "Operator Name",
      "Password": "optional-password",
      "CoTType": "a-f-G",
      "IconsetPath": "Lifelines/communications_infrastructure-gray-halo.png"
    }
  ],
  "EMERGENCY_TIMEOUT_HOURS": 6
}
```

**Custom Icons:**
- `IconsetPath`: Path to custom icon within an iconset (e.g., "Lifelines/communications_infrastructure-gray-halo.png")

**Example with Custom Icon:**
```json
{
  "ShareId": "your-share-id",
  "CallSign": "Communications Team",
  "IconsetPath": "Lifelines/communications_infrastructure-gray-halo.png"
}
```

**Emergency Alert System:**
- Automatically generates `b-a-o-tbl` (911 Alert) CoTs when devices enter emergency mode
- Generates `b-a-o-can` (Cancel Alert) CoTs when devices exit emergency mode
- Auto-cancels emergency alerts after `EMERGENCY_TIMEOUT_HOURS` if device goes offline (default: 6 hours)
- Emergency CoTs are separate from device position CoTs, following ATAK emergency handling standards

#### Test Mode
For development, testing or training without physical devices, enable test mode (only available when `ENABLE_TEST_MODE = true` in build configuration):

```json
{
  "TEST_MODE": true,
  "TEST_DEVICES": [
    {
      "IMEI": "300434030910340",
      "Name": "Test Operator 1",
      "DeviceType": "inReach Mini",
      "StartLat": -41.29,
      "StartLon": 174.78,
      "MovementPattern": "random_walk",
      "Speed": 5,
      "EmergencyMode": false,
      "MessageInterval": 10,
      "CoTType": "a-f-G",
      "IconsetPath": "Lifelines/communications_infrastructure-gray-halo.png"
    },
    {
      "IMEI": "300434030910341",
      "Name": "Emergency Test",
      "DeviceType": "inReach Explorer",
      "StartLat": -41.30,
      "StartLon": 174.79,
      "MovementPattern": "stationary",
      "Speed": 0,
      "EmergencyMode": true,
      "MessageInterval": 1,
      "CoTType": "a-f-G",
      "IconsetPath": "Lifelines/communications_infrastructure-gray-halo.png"
    }
  ]
}
```

**Movement Patterns:**
- `stationary`: Fixed position with GPS jitter
- `random_walk`: Random movement within radius
- `circular`: Circular movement pattern
- `linear_path`: Linear movement along path

**Device Types:**
- `inReach Mini`
- `inReach Explorer`
- `inReach SE+`
- `inReach Messenger`

**Emergency Testing:**
When `EmergencyMode: true` is set on a test device, it automatically cycles between emergency and normal states:
- **Minutes 0-4**: Normal operation (`In Emergency: False`)
- **Minutes 5-9**: Emergency active (`In Emergency: True`) → Generates `b-a-o-tbl` alert
- **Minutes 10-14**: Emergency cancelled (`In Emergency: False`) → Generates `b-a-o-can` alert
- **Minutes 15-19**: Emergency active again, and so on...

This provides automatic testing of the complete emergency alert lifecycle without manual intervention.

**Note:** Test mode configuration options are only visible in the CloudTAK UI when the ETL is built with `ENABLE_TEST_MODE = true`. Production builds should set this to `false` to hide test functionality.

## Deployment

Deployment into the CloudTAK environment for ETL tasks is done via automatic releases to the TAK.NZ AWS environment.

Github actions will build and push docker releases on every version tag which can then be automatically configured via the
CloudTAK API.

### GitHub Actions Setup

The workflow uses GitHub variables and secrets to make it reusable across different ETL repositories.

#### Organization Variables (recommended)
- `DEMO_STACK_NAME`: Name of the demo stack (default: "Demo")
- `PROD_STACK_NAME`: Name of the production stack (default: "Prod")

#### Organization Secrets (recommended)
- `DEMO_AWS_ACCOUNT_ID`: AWS account ID for demo environment
- `DEMO_AWS_REGION`: AWS region for demo environment
- `DEMO_AWS_ROLE_ARN`: IAM role ARN for demo environment
- `PROD_AWS_ACCOUNT_ID`: AWS account ID for production environment
- `PROD_AWS_REGION`: AWS region for production environment
- `PROD_AWS_ROLE_ARN`: IAM role ARN for production environment

#### Repository Variables
- `ETL_NAME`: Name of the ETL (default: repository name)

#### Repository Secrets (alternative to organization secrets)
- `AWS_ACCOUNT_ID`: AWS account ID for the environment
- `AWS_REGION`: AWS region for the environment
- `AWS_ROLE_ARN`: IAM role ARN for the environment

These variables and secrets can be set in the GitHub organization or repository settings under Settings > Secrets and variables.

### Manual Deployment

For manual deployment you can use the `scripts/etl/deploy-etl.sh` script from the [CloudTAK](https://github.com/TAK-NZ/CloudTAK/) repo.
As an example: 
```
../CloudTAK/scripts/etl/deploy-etl.sh Demo v1.0.0 --profile tak-nz-demo
```

### CloudTAK Configuration

When registering this ETL as a task in CloudTAK:

- Use the `<repo-name>.png` file in the main folder of this repository as the Task Logo
- Use the raw GitHub URL of this README.md file as the Task Markdown Readme URL

This will ensure proper visual identification and documentation for the task in the CloudTAK interface.

## Development

TAK.NZ provided Lambda ETLs are currently all written in [NodeJS](https://nodejs.org/en) through the use of a AWS Lambda optimized
Docker container. Documentation for the Dockerfile can be found in the [AWS Help Center](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)

```sh
npm install
```

Add a .env file in the root directory that gives the ETL script the necessary variables to communicate with a local ETL server.
When the ETL is deployed the `ETL_API` and `ETL_LAYER` variables will be provided by the Lambda Environment

```json
{
    "ETL_API": "http://localhost:5001",
    "ETL_LAYER": "19"
}
```

To run the task, ensure the local [CloudTAK](https://github.com/TAK-NZ/CloudTAK/) server is running and then run with typescript runtime
or build to JS and run natively with node

```
ts-node task.ts
```

```
npm run build
cp .env dist/
node dist/task.js
```

### Test Mode Configuration

Test mode functionality can be enabled or disabled at build time by modifying the `ENABLE_TEST_MODE` constant in `task.ts`:

```typescript
// Build-time configuration - change to false for production builds
const ENABLE_TEST_MODE = true;
```

**Development builds** (ENABLE_TEST_MODE = true):
- TEST_MODE and TEST_DEVICES configuration options are available in the UI
- Simulated device functionality is enabled
- Suitable for development, testing, and training environments

**Production builds** (ENABLE_TEST_MODE = false):
- TEST_MODE and TEST_DEVICES configuration options are completely hidden
- Test mode functionality is disabled and removed from the build
- Reduces configuration complexity for production deployments

**To create a production build:**
1. Change `ENABLE_TEST_MODE = true` to `ENABLE_TEST_MODE = false` in `task.ts`
2. Build and deploy as normal
3. Test mode options will not appear in the CloudTAK configuration UI

## License

TAK.NZ is distributed under [AGPL-3.0-only](LICENSE)
Copyright (C) 2025 - Christian Elsen, Team Awareness Kit New Zealand (TAK.NZ)
Copyright (C) 2023 - Public Safety TAK
