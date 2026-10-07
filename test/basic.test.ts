import test from 'node:test';
import assert from 'node:assert';
import { SchemaType, DataFlowType, InvocationType, StaticCapabilities, PERMISSIONS } from '@tak-ps/etl';

// task.ts calls Task.init() at module scope which requires an ETL environment,
// so these must be set before the dynamic import below
process.env.ETL_API = process.env.ETL_API || 'http://localhost:5001';
process.env.ETL_LAYER = process.env.ETL_LAYER || '1';
process.env.ETL_TOKEN = process.env.ETL_TOKEN || 'etl.test-token';

const { default: Task } = await import('../task.js');

test('Task static config', () => {
    assert.equal(Task.name, 'etl-inreach');
    assert.deepEqual(Task.flow, [DataFlowType.Incoming]);
    assert.deepEqual(Task.invocation, [InvocationType.Schedule]);
});

test('Incoming Input schema', async () => {
    const task = await Task.init();
    const schema = await task.schema(SchemaType.Input, DataFlowType.Incoming);

    assert.equal(schema.type, 'object');
    for (const key of [
        'INREACH_MAP_SHARES',
        'EMERGENCY_TIMEOUT_HOURS',
        'TEST_MODE',
        'TEST_DEVICES',
        'DEBUG'
    ]) {
        assert.ok(schema.properties[key], `Env schema missing property: ${key}`);
    }

    assert.equal(schema.properties.INREACH_MAP_SHARES.type, 'array');
    assert.equal(schema.properties.EMERGENCY_TIMEOUT_HOURS.type, 'number');
    assert.equal(schema.properties.EMERGENCY_TIMEOUT_HOURS.default, 6);
    assert.equal(schema.properties.TEST_MODE.type, 'boolean');
    assert.equal(schema.properties.TEST_MODE.default, false);
    assert.equal(schema.properties.DEBUG.type, 'boolean');
    assert.equal(schema.properties.DEBUG.default, false);

    const share = schema.properties.INREACH_MAP_SHARES.items;
    for (const key of ['ShareId', 'CallSign', 'Password', 'CoTType', 'IconsetPath']) {
        assert.ok(share.properties[key], `Share schema missing property: ${key}`);
    }
    assert.deepEqual(share.required, ['ShareId']);
});

test('Incoming Output schema', async () => {
    const task = await Task.init();
    const schema = await task.schema(SchemaType.Output, DataFlowType.Incoming);

    assert.equal(schema.type, 'object');
    for (const key of [
        'inreachId',
        'inreachName',
        'inreachDeviceType',
        'inreachIMEI',
        'inreachIncidentId',
        'inreachValidFix',
        'inreachText',
        'inreachEvent',
        'inreachEmergency',
        'inreachDeviceId',
        'inreachReceive'
    ]) {
        assert.ok(schema.properties[key], `Output schema missing property: ${key}`);
    }
    assert.equal(schema.properties.inreachReceive.format, 'date-time');
});

test('Outgoing flow is not provided', async () => {
    const task = await Task.init();
    const schema = await task.schema(SchemaType.Input, DataFlowType.Outgoing);

    assert.deepEqual(schema.properties, {});
});

test('capabilities.json is a valid manifest matching the task', async () => {
    const doc = await StaticCapabilities.read(new URL('../capabilities.json', import.meta.url).pathname);

    assert.equal(doc.name, 'Garmin inReach');
    assert.ok(doc.permissions.length > 0);
    for (const permission of doc.permissions) {
        // Resources are expressed as <permission>:<level>, where <level> may be a wildcard
        const [name, level] = permission.resource.split(':');
        assert.ok(PERMISSIONS[name], `Unknown permission: ${permission.resource}`);
        assert.ok(level === '*' || PERMISSIONS[name].includes(level), `Unknown permission level: ${permission.resource}`);
    }
    assert.equal(doc.invocations.incoming?.schedule?.default.schedule, 'rate(1 minute)');
});
