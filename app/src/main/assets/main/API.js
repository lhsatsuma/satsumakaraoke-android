var getClassGlobalAPI = null;

/**
 *
 * @returns {API}
 */
function getClassAPI()
{
    if(getClassGlobalAPI === null){
        getClassGlobalAPI = new API();
    }
    return getClassGlobalAPI;
}
class API
{
    token = {};
    errorToken = false;
    api_cfg = {};
    constructor()
    {
        this.cfg = getClassOptions().data.api_cfg;
        if(!this.cfg.api_url || !this.cfg.client_id || !this.cfg.client_secret){
            throw new Error('__BASE_URL_API, __CLIENT_ID or __CLIENT_SECRET is not defined');
        }
    }
    async handleAjax(args){
        if((args.endpoint !== 'token' && !this.token.access_token)
        || (this.token.expires_in <= formatDateTime())){
            this.token = {};
            let result_auth = await this.getToken();
            if(this.errorToken){
                return false;
            }
        }
        let argsFire = {
            url: this.cfg.api_url + args.endpoint,
            method: args.method ? args.method : 'get',
            dataType: 'json',
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            timeout: __TIMEOUT ? __TIMEOUT : 3000,
            success: function(d){
                if(!!d.status || args.endpoint === 'token'){
                    if(typeof args.callback == 'function'){
                        args.callback(d);
                    }
                }else{
                    if(typeof args.callbackError == 'function'){
                        args.callbackError(d);
                    }
                }
                if(!!args.callbackAll){
                    args.callbackAll(d);
                }
            },
            error: function(d){
                if(!!args.callbackError){
                    args.callbackError(d);
                }
                if(!!args.callbackAll){
                    args.callbackAll(d);
                }
            }
        }
        if(args.endpoint !== 'token'){
            argsFire.headers.Authorization = 'Bearer '+this.token.access_token;
        }
        if(typeof args.data == 'object'){
            args.data = JSON.stringify(args.data);
        }
        if(typeof args.headers == 'object'){
            argsFire.headers = $.extend(argsFire.headers, args.headers);
        }
        main.log('DEBUG', '[API] '+argsFire.url);
        argsFire = $.extend(argsFire, args);
        try {
            return await $.ajax(argsFire);
        }catch(e){
            main.log('ERROR', '[API] '+e.message);
            return false;
        }
    }

    async getToken()
    {
        if(this.token.access_token){
            //Already have a token
            return true;
        }
        let dateNow = moment();
        await this.handleAjax({
            endpoint: 'token',
            method: 'POST',
            data: {
                grant_type: 'client_credentials',
                client_id : this.cfg.client_id,
                client_secret: this.cfg.client_secret,
            },
            callback: (response) => {
                if(response.access_token) {
                    dateNow.add(response.expires_in-5, 'seconds');
                    this.token = response;
                    this.token.expires_in = formatDateTime(dateNow);
                    this.errorToken = false;
                }else{
                    this.errorToken = true;
                }
            },
            callbackError: (response) => {
                this.errorToken = true;
            }
        });
    }
    async getStatusPayload()
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'payload/last',
            method: 'GET',
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async getPayload(hash)
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'payload/get/'+hash,
            method: 'GET',
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async getWaitlist()
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'waitlist/get',
            method: 'GET',
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async auth(email, pass)
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'users/auth',
            method: 'POST',
            data: {
                "email": email,
                "password": window.btoa(pass)
            },
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async addWaitlist(music_id, user_id)
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'waitlist/put',
            method: 'PUT',
            data: {
                "music_id": music_id,
                "user_id": user_id
            },
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async setThread(action, val = null)
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'thread/set',
            method: 'PUT',
            data: {
                "action": action,
                "valueTo": val
            },
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
    async getThreadCopy()
    {
        let return_status = null;
        await this.handleAjax({
            endpoint: 'thread/getCopy',
            callback: (response) => {
                return_status = response.data;
            }
        });
        return return_status;
    }
}