import http from 'k6/http';
import {check} from 'k6';


export const options = {
    vus : 50,
    duration : '30s',
    thresholds : {
        http_req_duration : ['p(95)<50'],
    },
};

const CODE = 'd0s';


export default function(){
    const res = http.get(`http://localhost:3000/${CODE}`, { redirects : 0});
    check(res, { 'status is 302' : (r) => r.status == 302});
}