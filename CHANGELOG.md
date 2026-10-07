# CHANGELOG

## Emoji Cheatsheet
- :pencil2: doc updates
- :bug: when fixing a bug
- :rocket: when making general improvements
- :white_check_mark: when adding tests
- :arrow_up: when upgrading dependencies
- :tada: when adding new features

## Version History

### v1.4.0 - 2026-10-07
- :arrow_up: Raise the `@tak-ps/etl` range from `^10.8.0` to `^10.22.2`, satisfying the `>= 10.13.0` requirement for manifest-based capabilities (the lockfile already resolved 10.22.2). `task.ts` was re-checked against the 10.22.2 API (`Task.init`, `handler`, `local`, `DataFlowType`, `InvocationType`, `SchemaType`) and needed no changes. `npm update` changed nothing further and `npm audit` reports 0 vulnerabilities
- :pencil2: `capabilities.json` was re-checked against the actual API usage in `task.ts` and is unchanged. `feature:submit` remains the only permission: only `submit()` is permission gated, while `env()`, `ephemeral()` and `setEphemeral()` are not, and the Garmin request uses the global `fetch` rather than `this.fetch`
- :pencil2: Still deliberately NOT adopting the `cloudtak-etl` CLI for the build and push. Re-verified against `@tak-ps/etl` 10.22.2: `bin/build.ts` hardcodes the destination as `tak-vpc-<Environment>-cloudtak-tasks` with no override, while the TAK.NZ ECR repository is `<stackname>-etltasks`, resolved in `etl-deploy.yml` through the `EcrEtlTasksRepoArn` CloudFormation export. Switching would push to a repository CloudTAK does not read. The manual `docker buildx build` with the `com.cloudtak.capabilities` annotation and the export lookup are kept. Adopting the CLI needs an upstream change making the repository name configurable
- :rocket: Add `.agents/` to `.dockerignore` so workflow artifacts stay out of the image build context
### v1.3.0 - 2026-10-07
- :tada: Add a `capabilities.json` manifest so CloudTAK can read the task's requirements from the image. It declares a single required permission, `feature:submit` (the only CloudTAK API call that publishes data is `submit()`; `env()` and the ephemeral state calls are not gated by a permission), 1024 MB memory / 120 s timeout, and a default `rate(1 minute)` schedule. The one minute default keeps the minute-aligned `TEST_MODE` device simulation (`MessageInterval`) working as before. It is validated against `StaticCapabilitiesSchema` from `@tak-ps/etl`, and a test guards it in CI
- :rocket: Build and push the image with `docker buildx` in the demo and production deploy jobs, embedding `capabilities.json` as the `com.cloudtak.capabilities` OCI annotation, with `docker/setup-buildx-action@v4` providing the `docker-container` builder the annotation needs. The `docker build` / `docker tag` / `docker push` sequence is replaced by a single `docker buildx build`. The image build and contents were checked locally with a plain `docker build`; the buildx annotation push itself has not been run against ECR or checked in the demo environment
- :pencil2: Deliberately NOT adopting the `cloudtak-etl` CLI from `@tak-ps/etl` for the build and push: its `bin/build.ts` hardcodes the destination ECR repository as `tak-vpc-<Environment>-cloudtak-tasks`, which does not match the `<stackname>-etltasks` repository used by TAK.NZ base-infra. The existing lookup of the repository through the `EcrEtlTasksRepoArn` CloudFormation export is kept unchanged
- :white_check_mark: Add a basic test suite (`npm test`, `node:test` run through `tsx`) covering the task's static config, input and output schemas and the manifest; the `lint` script now also covers `test/`. `npm test` was previously `exit 0`
- :rocket: Require Node 24 (`engines` `>= 24`), and use Node 24 in the lint and deploy workflows (both were still on Node 18), matching the Lambda base image
- :arrow_up: Update dependencies within their existing ranges: `@tak-ps/etl` 10.22.2, `eslint` 10.12.0 and `typescript-eslint` 8.71.1, and add `tsx` ^4.23.15 for the test runner. `npm audit` now reports 0 vulnerabilities (7 before: 3 moderate, 3 high, 1 critical). `typescript` stays on 6.0.3 as `typescript-eslint` still limits supported versions to below 6.1.0
- :rocket: Add a `.dockerignore` so `.git`, `.github`, `node_modules`, `dist`, `test`, `docs`, `.env*` and markdown files are kept out of the image build context. `capabilities.json`, `task.ts`, `package*.json` and `tsconfig.json` stay in the context
- :rocket: Use `docker/setup-buildx-action` v4 in the deploy jobs, in line with the Node.js 24 action updates in the entries below. Not yet run in CI on this version
### v5.1.0 - 2024-08-04

- :arrow_up: Update Core Deps
- :arrow_up: Update GitHub Actions to releases that run on Node.js 24, clearing the Node.js 20 deprecation warnings: `actions/checkout` v7, `actions/setup-node` v7 and `aws-actions/configure-aws-credentials` v6. `aws-actions/amazon-ecr-login` v2 already runs on Node.js 24. Not yet run in CI on these versions
- :rocket: Pin the workflow runners to `ubuntu-24.04` instead of `ubuntu-latest`, so the `ubuntu-latest` migration to Ubuntu 26 (starting October 19, 2026) does not change the build environment unannounced

### v5.0.0 - 2024-07-02

- :tada: Split EverywhereHub ETL into its own package

### v4.10.0 - 2024-06-17

- :rocket: Introduce debug options for ETL Webhooks

### v4.9.0 - 2024-06-16

- :rocket: Update incoming Webhooks URL

### v4.8.0 - 2024-05-21

- :rocket: Update to use new Share URL

### v4.7.1 - 2024-05-21

- :rocket: Log Human UI URL

### v4.7.0 - 2024-05-21

- :rocket: Increased fault tolerance

### v4.6.0 - 2024-04-17

- :rocket: Support Express@5 in ETL

### v4.5.0 - 2024-04-17

- :rocket: Additional Debug options

### v4.4.0 - 2024-04-17

- :rocket: Specify types so node Strip Types works

### v4.3.0 - 2024-04-16

- :tada: Allow running locally

### v4.2.2 - 2024-04-16

- :bug: Temp Debug

### v4.2.1 - 2024-04-16

- :bug: Temp Debug

### v4.2.0 - 2024-04-16

- :rocket: Add additional debug options

### v4.1.0 - 2024-04-16

- :bug: `Alias` is an optional field
- :arrow_up: Update all core deps

### v4.0.0

- :tada: Update to `CloudTAK@v6`

### v3.10.0

- :tada: Increase Capabilities API support

### v3.9.0

- :rocket: Add incoming/outgoing support

### v3.8.0

- :rocket: Add MapShare link if available

### v3.7.3

- :rocket: Switch to IMEI as Id is a message ID and not a device

### v3.7.2

- :rocket: Use device ID for CoT UID

### v3.7.1

- :rocket: Handle errors and return status code

### v3.7.0

- :rocket: Add strong types & submission of Webhook CoTs

### v3.6.4

- :bug: Add WebHook ID to Schema Syntax

### v3.6.3

- :arrow_up: Update ETL-Base

### v3.6.2

- :arrow_up: Update ETL-Base

### v3.6.1

- :bug: Fix TS Build Errors

### v3.6.0

- :tada: Start to sketch out WebHook Support

### v3.5.0

- :rocket: Add password support for Garmin KML
- :arrow_up: Update all deps

### v3.4.1

- :arrow_up: Remove Legacy ESLint

### v3.4.0

- :arrow_up: Update to latest ETL Base

### v3.3.0

- :rocket: Use metadata

### v3.2.0

- :rocket: Add `inreachReceive` time

### v3.1.4

- :arrow_up: Update ETL Base

### v3.1.3

- :arrow_up: Update Core Deps

### v3.1.2

- :arrow_up: Update Core Deps

### v3.1.1

- :arrow_up: Update Core Deps

### v3.1.0

- :rocket: Add additional properties including `Course` and `Speed`

### v3.0.0

- :rocket: Update in latest token format

### v2.0.1

- :bug: Continue on parsing error

### v2.0.0

- :rocket: Update to ETL@2

### v1.6.1

- :rocket: Add increased logging

### v1.6.0

- :tada: Parse XML Document

### v1.5.2

- :bug: Fix Schema Statement

### v1.5.1

- :rocket: Add `CallSign` field and display as simple table

### v1.5.0

- :tada: Initial Commit
