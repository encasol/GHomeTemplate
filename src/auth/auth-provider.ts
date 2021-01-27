import { Express } from 'express';
import util from 'util';

export interface IAuthProvider {
    init(): void;
}

export class AuthProvider implements AuthProvider {
    private app: Express;

    constructor(app: Express) {
        this.app = app;
    }

    init() {
        this.app.get('/login', this.loginGET);
        this.app.post('/login', this.loginPOST);
        this.app.get('/fakeauth', this.fakeauthGET);
        this.app.post('/faketoken', this.faketokenPOST);
    }

    private loginGET(request, response): void {
        // console.log('Requesting login page ' + request.query.responseurl);
        response.send(`
        <html>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <body>
            <form action="/login" method="post">
            <input type="hidden"
                name="responseurl" value="${request.query.responseurl}" />
            <button type="submit" style="font-size:14pt">
                Link this service to Google
            </button>
            </form>
        </body>
        </html>
        `);  
    }

    private loginPOST(request, response): void {
        console.log('login');
        // Here, you should validate the user account.
        // In this sample, we do not do that.
        const responseurl = decodeURIComponent(request.body.responseurl);
        // console.log(`Redirect to ${responseurl}`);
        return response.redirect(responseurl);
    }

    private fakeauthGET(request, response): void {
        console.log('fakeauth');
        const responseurl = util.format('%s?code=%s&state=%s',
            decodeURIComponent(request.query.redirect_uri as string), 'xxxxxx',
            request.query.state);

        return response.redirect(`/login?responseurl=${encodeURIComponent(responseurl)}`);
    }

    private faketokenPOST(request, response): void {
        console.log('/faketoken');
        const grantType = request.query.grant_type ? request.query.grant_type : request.body.grant_type;
        const secondsInDay = 86400; // 60 * 60 * 24
        const HTTP_STATUS_OK = 200;
      
        let obj;
        if (grantType === 'authorization_code') {
            obj = {
                token_type: 'bearer',
                access_token: '123access',
                refresh_token: '123refresh',
                expires_in: secondsInDay,
            };
        } else if (grantType === 'refresh_token') {
            obj = {
                token_type: 'bearer',
                access_token: '123access',
                expires_in: secondsInDay,
            };
        }
        response.status(HTTP_STATUS_OK).json(obj);
    }
}