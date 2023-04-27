var getClassGlobalRemoteControl = null;

/**
*
* @returns {RemoteControl}
*/
function getClassRemoteControl()
{
if(getClassGlobalRemoteControl === null){
    getClassGlobalRemoteControl = new RemoteControl();
}
return getClassGlobalRemoteControl;
}
class RemoteControl{
    data = {};
    constructor() {

    }

    async setTabContent()
    {
        await $('#nav-remote-control').html(`<div class="container-sm">
            <div class="col-12 text-center mb-5">
                <h5>Controle Remoto</h5>
            </div>
            <div class="row text-center">
                <div class="col-6"><span class="ptr controlbtns" data-val="play"><i
                    class="fas fa-play margin-5"></i><p>Play</p></span></div>
                <div class="col-6"><span class="ptr controlbtns" data-val="pause"><i
                    class="fas fa-pause margin-5"></i><p>Pausar</p></span></div>
            </div>
            <div class="row text-center">
                <div class="col-6"><span class="ptr controlbtns" data-val="repeat"><i
                    class="fas fa-sync-alt margin-5"></i><p>Repetir</p></span></div>
                <div class="col-6"><span class="ptr controlbtns" data-val="next"><i
                    class="fas fa-step-forward margin-5"></i><p>Próximo</p></span></div>
            </div>
            <div class="row text-center">
                <div class="col-12 mb-4"><span class="ptr"><p id="volP">15%</p><input type="range"
                 class="form-control-range"
                 id="volumeRange" step="5"></span>
                </div>
            </div>
            <div class="row text-center">
                <div class="col-12"><span class="ptr controlbtns" data-val="mute"><i
                    class="fas fa-volume-mute margin-5"></i><p>Mutar</p></span></div>
            </div>
        </div>`);

        $('.controlbtns').on('click', (e) => {
            let domObj = $(e.currentTarget);
            $(domObj).trigger('focusout');
            getClassAPI().setThread($(domObj).attr('data-val'));
        });

        $('#volumeRange').val(100);

        document.getElementById('volumeRange').addEventListener('input', function() {
            getClassRemoteControl().changedVolumeRange();
        });

        setInterval(() => {
            if(__TAB_ACTIVE == 'remote-control') {
                getClassRemoteControl().getLastVolume();
            }
        }, 10*1000);

        await this.getLastVolume();
    }

    async changedVolumeRange()
    {
        $('#volP').html($('#volumeRange').val()+'%');

        await getClassAPI().setThread('volume', $('#volumeRange').val());
    }

    async getLastVolume(needCheck = false)
    {
        let thread_copy = await getClassAPI().getThreadCopy();
        if(thread_copy.volume){
            $('#volumeRange').val(thread_copy.volume);
            $('#volP').html(thread_copy.volume+'%');
        }
    }
}