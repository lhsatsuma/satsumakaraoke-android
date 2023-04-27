var getClassGlobalProfile = null;

/**
 *
 * @returns {Profile}
 */
function getClassProfile()
{
    if(getClassGlobalProfile === null){
        getClassGlobalProfile = new Profile();
    }
    return getClassGlobalProfile;
}
class Profile{
    data = {};
    constructor() {
        this.data = storage.get('savedProfile') ? storage.get('savedProfile') : {};
    }

    saveStorage()
    {
        storage.save('savedProfile', this.data);
        return true;
    }

    async setTabContent()
    {
        let url_create_account = getClassOptions().data.api_cfg.base_url+'login/createAccount';
        await $('#nav-profile').html(`<div class="container">
            <div class="col-12 text-center mb-5">
                <h5>Meu Perfil</h5>
            </div>
            <div class="row login-row">
                <div class="col-12">
                    <p>Faça o login</p>
                </div>
                <div class="col-12">
                    <p><input type="text" class="form-control" name="email_address" placeholder="Email"></p>
                    <p><input type="password" class="form-control" name="password" placeholder="Senha"></p>
                    <p><button type="button" class="btn btn-info"  onclick="getClassProfile().auth()">Conectar</button> <a href="${url_create_account}" target="_blank">Criar Conta</a></p>
                    <p></p>
                </div>
            </div>
            <div class="row logged-info">
                <div class="col-12">
                    <p>Olá, <span class="user-name"></span></p>
                    <p><button type="button" class="btn btn-primary" onclick="getClassProfile().logout()">Sair da minha conta</button></p>
                </div>
            </div>
        </div>`);
        this.setRowsInfo();
    }
    async setRowsInfo()
    {
        if(!!this.data.id){
            $('.login-row').hide();
            $('.logged-info').show();
            $('.login-required').hide();
            $('#InsertFilaBtn').removeAttr('disabled');
            $('.logged-info').find('.user-name').html(this.data.name);
        }else{
            $('.logged-info').hide();
            $('.login-row').show();
            $('.login-required').show();
            $('#InsertFilaBtn').attr('disabled', true);
            $('.logged-info').find('.user-name').html('');
        }
    }
    async auth()
    {
        let valid = true;
        $('.validate-error').remove();
        if(!$('input[name="email_address"]').val()){
            $('input[name="email_address"]').after('<p class="validate-error error">O campo Email é obrigatório.</p>');
            valid = false;
        }
        if(!$('input[name="password"]').val()){
            $('input[name="password"]').after('<p class="validate-error error">O campo Senha é obrigatório.</p>');
            valid = false;
        }

        if(valid){
            let authenticated = await getClassAPI().auth($('input[name="email_address"]').val(), $('input[name="password"]').val());
            if(authenticated === false){
                swalWarning('Email ou senha incorretos.');
            }
            this.data = authenticated;
            this.saveStorage();
            location.reload();
        }
    }
    logout()
    {
        swalConfirm({
            text: 'Deseja mesmo sair de sua conta?'
        },
        (confirmed) => {
            if(confirmed) {
                this.data = {};
                this.saveStorage();
                location.reload();
            }
        });
    }

    checkPerm(cod, p)
    {
        cod = cod.toString();
        if(this.data.perms && this.data.perms[cod]){
            if(this.data.perms[cod][p]){
                return true;
            }
        }
        return false;
    }
}