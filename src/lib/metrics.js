const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_in_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
});


function metricsMiddleware(req, res, next) {
    if (req.path === '/metrics') return next();
    const end = httpRequestDuration.startTimer();
    res.on('finish', ()=>{
        const route = req.route ? (req.baseUrl || '') + req.route.path : 'unmatched';
        const labels = { method: req.method, route, status: res.statusCode};
        httpRequestsTotal.inc(labels);
        end(labels);
    });
    next();
}


async function metricsHandler(req, res) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
}


module.exports = { metricsMiddleware, metricsHandler }