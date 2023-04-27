var getClassGlobalOptions = null;

/**
 *
 * @returns {Options}
 */
function getClassOptions()
{
    if(getClassGlobalOptions === null){
        getClassGlobalOptions = new Options();
    }
    return getClassGlobalOptions;
}
class Options{
    data = {
        autoRefresh: __WAITLIST_REFRESH,
        internalApp: __FORCE_CFG_INTERNAL ? true : false,
        api_cfg: __FORCE_CFG_INTERNAL ? __CFG_INTERNAL : __CFG_PROD
    };
    constructor()
    {
        if(storage.get('optionsData')){
            this.data = storage.get('optionsData');
        }

        //Debug is no longer active, and the cfg of internal app is valid.
        if(!__DEBUG && this.data.internalApp){
            this.data.internalApp = false;
            this.saveData();
        }
    }
    async setTabContent()
    {
        await $('#nav-options').html(`<div class="col-12 m-0 p-0">
            <div class="container">
                <div class="col-12 text-center mb-3">
                    <h5>Opções do aplicativo</h5>
                    <p style="font-size: 0.8rem" class="error">Versão ${__VERSION}</p>
                </div>
                <table class="table table-options">
                    <tbody>
                        <tr>
                            <td class="pl-0 pr-0 pt-4 pb-4 align-middle">Atualização automática fila</td>
                            <td class="pl-0 pr-0 pt-4 pb-4 text-center align-middle">
                                <select id="autoRefreshRate" class="form-control" onchange="getClassOptions().setAutoRefreshRate(this.value)">
                                    <option value="0">Desabilitado</option>
                                    <option value="15">15 seg</option>
                                    <option value="30">30 seg</option>
                                    <option value="60">60 seg</option>
                                    <option value="120">120 seg</option>
                                </select>
                            </td>
                        </tr>
                        <tr id="AppUpdate">
                            <td class="pl-0 pr-0 pt-4 pb-4 align-middle">Verificar atualizações<br />
                            <span style="font-size: 0.8rem" class="span-app-update">Nova versão disponível</span></td>
                            <td class="pl-0 pr-0 pt-4 pb-4 text-center align-middle"><p class="m-0"><i style="font-size: 1.5rem" class="fas fa-download" onclick="getClassOptions().confirmAppUpdate()"></i></p></td>
                        </tr>
                        <tr id="trClearData">
                            <td class="pl-0 pr-0 pt-4 pb-4 align-middle">Limpar os dados salvos no aplicativo<br />
                            <span style="font-size: 0.8rem" class="error">Reseta os dados do aplicativo</span></td>
                            <td class="pl-0 pr-0 pt-4 pb-4 text-center align-middle"><button type="button" class="btn btn-outline-warning btn-rounded" onclick="getClassOptions().confirmClearData()">Limpar</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`);
        $('#autoRefreshRate').val(this.data.autoRefresh);

        if(!compareVersion(main.payloadStatus.android_app.version)){
            $('#AppUpdate').find('.span-app-update').addClass('error').html('Nova versão disponível');
        }else{
            $('#AppUpdate').find('.span-app-update').addClass('success').html('Aplicativo atualizado');
        }

        if(__DEBUG){
            $('#trClearData').before(`
            <tr>
                <td class="pl-0 pr-0 pt-4 pb-4 align-middle">App Interno<br /><span style="font-size: 0.8rem" class="warning">Para utilizar o sistema local</span></td>
                <td class="pl-0 pr-0 pt-4 pb-4 text-center align-middle"><select id="internalApp" class="form-control" onchange="getClassOptions().setInternalApp(this.value)">
                    <option value="0" selected>Não</option>
                    <option value="1">Sim</option>
                </select></td>
            </tr>
            `);
            if(!!this.data.internalApp) {
                $('#internalApp').val('1');
            }
        }
        return true;
    }
    saveData()
    {
        this.data.api_cfg = this.data.internalApp ? __CFG_INTERNAL : __CFG_PROD;


        storage.save('optionsData', this.data);
        return true;
    }

    setAutoRefreshRate(rate)
    {
        this.data.autoRefresh = parseInt(rate);
        getClassWaitlist().resyncRefresh();
        this.saveData();
    }

    setInternalApp(value)
    {
        value = value == '1' ? true : false;
        if(value) {
            swalConfirm({
                text: 'Deseja mesmo trocar a configuração de API?'
            },
            (confirmed) => {
                if (confirmed) {
                    this.data.internalApp = !!value;
                    this.saveData();
                    location.reload();
                }
            });
        }else{
            this.data.internalApp = false;
            this.saveData();
            location.reload();
        }
    }

    confirmClearData()
    {
        swalConfirm({
            text: 'Deseja mesmo limpar os dados?'
        },
        (confirmed) => {
            if(confirmed){
                main.log('INFO', 'Cleaning app data');
                getClassOptions().clearData();
            }
        });
    }

    clearData()
    {
        storage.reset();
        location.reload();
    }

    confirmAppUpdate(options_screen = true)
    {
        if(!compareVersion(main.payloadStatus.android_app.version)) {
            swalConfirm({
                text: 'Existe uma nova atualização do aplicativo. Deseja baixar?'
            }, (confirmedVersion) => {
                if (confirmedVersion) {
                    window.open(getClassOptions().data.api_cfg.base_url + 'downloadManager/download/' + main.payloadStatus.android_app.hash, '_blank');
                    return;
                }

                //User chooses to skip update.
                if(!options_screen) {
                    storage.save('skipAppUpdate', main.payloadStatus.android_app.version);
                    location.reload();
                }
            });
        }else if(options_screen){
            swalSuccess('O aplicativo já está atualizado com a última versão!');
        }
    }
}