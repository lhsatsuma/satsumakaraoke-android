var getClassGlobalMain = null;
var __TAB_ACTIVE = 'musics';
/**
 *
 * @returns {MainApp}
 */
function getClassMain(version_apk)
{
    if(getClassGlobalMain === null){
        getClassGlobalMain = new MainApp(version_apk);
    }
    return getClassGlobalMain;
}
class MainApp
{
    intervalStatus = {
        active: false,
        intervalCommand: null,
        lastInt: 0,
    };
    api = null;
    payloadStatus = null;
    payloadStatusDate = null;
    payload = null;
    payloadDate = null;
    constructor(version_apk)
    {
        __VERSION = version_apk;
    }
    async initApp()
    {
        //Show loading div with 100%
        await this.showLoadingApp();

        let valid_init = true;

        //Try to instantiate api
        //Any errors has to make initApp dies
        try {
            this.api = getClassAPI();
            this.setVarsFromStorage();
        }catch(e){
            this.changeStatus('Erro ao carregar o aplicativo! Contate o administrador', true, '0x001');
            console.log('Error catch instantiate API: ',e)
            return false;
        }


        let dateCompare = formatDateTime(moment().subtract(__PAYLOAD_CHECK_INTERVAL, 'minutes'));


        if(this.payloadStatus && this.payload && dateCompare <= this.payloadStatusDate){
            //Recent payload
            this.changeStatus('Carga recente! Pulando verificação');
        }else {
            this.changeStatus('Verificando ultima carga');
            let lastPayloadStatus = await this.fetchLastPayloadStatus();
            this.setVarsFromStorage();
            if (!lastPayloadStatus && !storage.get('payloadStatus')) {
                this.changeStatus('Não foi possível verificar o status da ultima carga! Verifique sua conexão com a internet', true, '1x002');
                return false;
            }else if(storage.get('skipAppUpdate') !== this.payloadStatus.android_app.version && lastPayloadStatus && !compareVersion(this.payloadStatus.android_app.version)){
                this.changeStatus('Nova versão do aplicativo disponível...');
                getClassOptions().confirmAppUpdate(false);
                return false;
            }else if (!lastPayloadStatus && this.payload) {
                this.changeStatus('Trabalhando com a ultima carga disponivel');
            }

            let lastPayload = false;
            if (!this.payload
                || this.payloadStatus.date !== storage.get('payloadDate')) {
                this.changeStatus('Atualizando carga');
                storage.remove('payload');
                storage.remove('payloadDate');
                this.payload = null;
                lastPayload = await this.fetchLastPayload();
                this.setVarsFromStorage();
                if (!lastPayload) {
                    this.changeStatus('Não foi possível buscar os dados da carga! Contate o administrador', true, '1x003');
                    return false;
                }
                this.changeStatus('Carga atualizada!');
            } else {
                this.changeStatus('Carga ja esta atualizada');
            }
        }

        if(valid_init) {
            //Everything is ok, lets mount tables
            this.changeStatus('Preparando aplicativo');
            await this.setInitialScreen();
            await this.mountTabContents();
            this.changeStatus('Aplicativo pronto!');
            await this.removeLoadingApp();
            return true;
        }
        return false;
    }
    async mountTabContents()
    {
        await getClassMusics().setTabContent();
        await getClassFavorites().setTabContent();
        await getClassWaitlist().setTabContent();
        if(getClassProfile().checkPerm(1001, 'r')){
            await getClassRemoteControl().setTabContent();
        }
        await getClassProfile().setTabContent();
        await getClassOptions().setTabContent();
    }
    setVarsFromStorage()
    {
        this.payloadStatus = storage.get('payloadStatus');
        this.payloadStatusDate = storage.get('payloadStatusDate');
        this.payload = storage.get('payload');
        this.payloadDate = storage.get('payloadDate');
    }

    async fetchLastPayloadStatus()
    {
        try{
            let statusPayload = await this.api.getStatusPayload();
            if(statusPayload) {
                storage.save('payloadStatus', statusPayload);
                storage.save('payloadStatusDate', formatDateTime());
            }
            if(statusPayload || storage.get('payloadStatus')){
                return true;
            }
        }catch(e){
            this.changeStatus('Erro ao consultar a API! Vamos de modo offline', true, '1x001');
            console.log('Error catch: ',e)
        }
        return false;
    }

    async fetchLastPayload()
    {
        try{
            let lastPayload = await this.api.getPayload(this.payloadStatus.hash);
            if (lastPayload) {
                storage.save('payload', lastPayload);
                storage.save('payloadDate', storage.get('payloadStatus').date);
            }

            if(lastPayload || storage.get('payload')){
                return true;
            }
        }catch(e){
            this.changeStatus('Erro ao consultar a API!', true, '1x001');
            console.log('Error catch: ',e)
        }

        return false;
    }

    async showLoadingApp()
    {
        let html = `<div id="loadingAppDiv" class="wrapper vcenter-item vh-100">
            <div class="row box">
                <div class="col-12 m-0 p-0 text-center align-middle">
                    <p><img src="assets/images/logo.png" /></p>
                    <!--<p class="d-none"><img class="loading-gif" src="assets/images/loading.gif" style="max-width: 80px"/></p>-->
                    <p class="mt-5" id="loadingStatus"></p>
                </div>
            </div>
        </div>`;
        return await $('#body').before(html);
    }

    async removeLoadingApp()
    {
        if(this.intervalStatus.active && this.intervalStatus.intervalCommand){
            clearInterval(this.intervalStatus.intervalCommand);
        }
        $('.btn-nav-tab').on('click', (e) => {
            __TAB_ACTIVE = $(e.currentTarget).data('target').replace('#nav-', '');
        });

        $('#bodyContainer').show();
        return await $('#loadingAppDiv').remove();
    }

    changeStatus(msg, error = false, error_code = ''){
        if(this.intervalStatus.active && this.intervalStatus.intervalCommand){
            clearInterval(this.intervalStatus.intervalCommand);
        }
        if(error){
            $('#loadingStatus').addClass('error');
            $('#loadingAppDiv').find('.loading-gif').hide();
            $('#loadingAppDiv').find('.loadingInfo').hide();
            msg += '<br />Tracer: '+error_code;
            this.log('DEBUG', '[MainApp] ' + msg);
            $('#loadingStatus').html(msg);
        }else{
            $('#loadingStatus').removeClass('error');
            this.intervalStatus.lastInt = 0;
            this.log('DEBUG', '[MainApp] ' + msg);
            if(this.intervalStatus.active) {
                this.intervalStatus.intervalCommand = setInterval(() => {
                    if( this.intervalStatus.lastInt >= 6){
                         this.intervalStatus.lastInt = 0;
                    }
                    $('#loadingStatus').html(msg+'.'.repeat( this.intervalStatus.lastInt));
                     this.intervalStatus.lastInt++;
                }, 300);
            }else{
                $('#loadingStatus').html(msg);
            }
        }
    }

    log(type, msg)
    {
        if(__DEBUG) {
            console.log('[' + formatDateTime() + '][' + type + '] ' + msg);
        }
    }

    async setInitialScreen()
    {
        await $('#body').append(`<div class="w-100 p-0" id="bodyContainer" style="display: none">
            <div class="row d-none api-offline">
                <div class="col-12 error text-center">
                    <p class="m-0">API Offline!</p>
                    <p>Algumas funções estão desabilitadas.</p>
                </div>
            </div>
            <div class="tab-content" id="nav-tabContent">
                <div class="pt-3 tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"></div>
                <div class="pt-3 tab-pane fade" id="nav-favorites" role="tabpanel" aria-labelledby="nav-favorites-tab"></div>
                <div class="pt-3 tab-pane fade" id="nav-waitlist" role="tabpanel" aria-labelledby="nav-waitlist-tab"></div>
                <div class="pt-3 tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab"></div>
                <div class="pt-3 tab-pane fade" id="nav-options" role="tabpanel" aria-labelledby="nav-options-tab"></div>
            </div>
            <nav class="navbar fixed-bottom navbar-expand-sm navbar-dark">
                <div class="tabbable nav nav-tabs container-fluid justify-content-around" id="nav-tab" role="tablist">
                    <button class="btn-nav-tab nav-link btn-info active" id="nav-home-tab" data-toggle="tab" data-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true"><i class="fa fa-music"></i></button>
                    <button class="btn-nav-tab nav-link btn-info" id="nav-favorites-tab" data-toggle="tab" data-target="#nav-favorites" type="button" role="tab" aria-controls="nav-favorites" aria-selected="false"><i class="fa fa-star"></i></button>
                    <button class="btn-nav-tab nav-link btn-info" id="nav-waitlist-tab" data-toggle="tab" data-target="#nav-waitlist" type="button" role="tab" aria-controls="nav-waitlist" aria-selected="false"><i class="fa fa-list"></i></button>
                    <button class="btn-nav-tab nav-link btn-info" id="nav-profile-tab" data-toggle="tab" data-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false"><i class="fa fa-user"></i></button>
                    <button class="btn-nav-tab nav-link btn-info" id="nav-options-tab" data-toggle="tab" data-target="#nav-options" type="button" role="tab" aria-controls="nav-options" aria-selected="false"><i class="fa fa-cog"></i></button>
                </div>
            </nav>
        </div>`);

        //User has access to remote control
        if(getClassProfile().checkPerm(1001, 'r')){
            $('#nav-waitlist-tab').after('<button class="btn-nav-tab nav-link btn-info" id="nav-remote-control-tab" data-toggle="tab" data-target="#nav-remote-control" type="button" role="tab" aria-controls="nav-remote-control" aria-selected="false"><i class="fa fa-tv"></i></button>');
            $('#nav-waitlist').after('<div class="pt-3 tab-pane fade" id="nav-remote-control" role="tabpanel" aria-labelledby="nav-remote-control-tab"></div>');
        }
    }
}