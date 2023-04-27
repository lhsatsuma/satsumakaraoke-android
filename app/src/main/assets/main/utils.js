function formatDate(moment_date)
{
    if(typeof moment_date == 'undefined'){
        moment_date = moment();
    }
    return moment_date.format('YYYY-MM-DD');
}
function formatDateTime(moment_date)
{
    if(typeof moment_date == 'undefined'){
        moment_date = moment();
    }
    return moment_date.format('YYYY-MM-DD HH:mm:ss');
}

async function sleep(ms)
{
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function swalFire(args = {}){
    if(Swal.isVisible()){
        Swal.close();
    }
    return Swal.fire(args);
}
function swalWarning(msg = null){
    swalFire({
        title:'Ops!',
        text: msg,
        icon: 'warning',
        allowOutsideClick: false,
        didOpen: () => {
            $('.swal2-confirm').trigger('focus');
        }
    });
}
function swalConfirm(args = {}, callback){
    let argsDefault = {
        title: 'Confirme a ação',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Cancelar'
    };

    argsDefault = $.extend(argsDefault, args);
    swalFire(argsDefault).then((result) => {
        callback(result.isConfirmed);
    })
}

function swalLoading(args = {}){
    let argsFire = {
        title:'Aguarde...',
        text: 'Estamos processando a requisição...',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            swal.showLoading();
        }
    };
    argsFire = $.extend(argsFire, args);
    swalFire(argsFire);
}

function swalErrorGeneric(msg = null){
    let argsFire = {
        title:'Ops! Algo deu errado!',
        html: '<p>Tente novamente mais tarde ou entre em contato com o administrador.</p>',
        icon: 'error',
        allowOutsideClick: false,
    };
    if(msg){
        argsFire.html = msg;
    }
    swalFire(argsFire);
}

function swalSuccess(msg = null){
    let argsFire = {
        title: 'Sucesso',
        html: msg ?? '',
        icon: 'success',
        allowOutsideClick: false,
    };
    if(msg){
        argsFire.html = msg;
    }
    swalFire(argsFire);
}

function swalQuestion(title, msg = null){
    let argsFire = {
        title: '',
        html: msg ?? '',
        icon: 'question',
        allowOutsideClick: false,
    };
    if(msg){
        argsFire.html = msg;
    }
    swalFire(argsFire);
}

/**
 * Compare versions for updates
 * @param version_compare
 * @returns {boolean}
 */
function compareVersion(version_compare)
{
    if(!version_compare){
        return false;
    }

    let app_version = __VERSION.toString().split('.');
    version_compare = version_compare.toString().split('.');
    let valid = true;

    //Lets compare sub versions
    for(let i=0;i<app_version.length;i++){
        let version_int = parseInt(app_version[i]);
        let compare_int = parseInt(version_compare[i]);

        //Compared version has difference of actual version
        if(version_int < compare_int){
            valid = false;
            return;
        }else if(version_int > compare_int){
             break;
         }
    }
    return valid;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}