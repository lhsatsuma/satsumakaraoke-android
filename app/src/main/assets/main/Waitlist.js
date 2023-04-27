var getClassGlobalWaitlist = null;

/**
 *
 * @returns {Waitlist}
 */
function getClassWaitlist()
{
    if(getClassGlobalWaitlist === null){
        getClassGlobalWaitlist = new Waitlist();
    }
    return getClassGlobalWaitlist;
}
class Waitlist
{
    data = [];
    tableMounted = null;
    secondsLeft = getClassOptions().data.autoRefresh;
    constructor() {
        this.api = getClassAPI();
    }
    async setTabContent()
    {
        let class_autorefresh = !getClassOptions().data.autoRefresh ? 'd-none' : '';
        await $('#nav-waitlist').html(`<div class="container">
            <div class="row">
                <div class="col-12 text-center mb-5">
                    <h5>Músicas na Fila</h5>
                </div>
                <div class="col-4 pr-4">
                    <button type="button" class="btn btn-success" style="font-size: 0.8rem" onclick="getClassWaitlist().forceRefresh()"><i class="fas fa-sync-alt"></i> Atualizar</button>
                </div>
                <div class="col-8 text-right ${class_autorefresh}" id="waitlistAutorefresh">
                    <p style="font-size: 0.8rem">Atualização automática: <span class="font-weight-bold" id="waitlistTimeleft">${getClassOptions().data.autoRefresh}</span> seg(s)</p>
                </div>
            </div>
            <table id="waitlistTable" class="display w-100">
                <thead>
                <tr>
                    <th data-name="codigo">#</th>
                    <th>Usuário</th>
                    <th>Nome</th>
                </tr>
                </thead>
            </table>
        </div>`);
        $('#autoRefreshRate').val(this.data.autoRefresh);

        let langPTBR = new DataTableLangPTBR().getLang();
        let dataMusics = await this.getDataWaitlist();

        this.tableMounted = await $('#waitlistTable').DataTable( {
            language: langPTBR,
            lengthChange: false,
            data: dataMusics,
            iDisplayLength: 50,
            autoWidth: false,
            columns: [
                {
                    data: 'rowNumber',
                    width: '15%',
                    class: 'rowNumber'
                },
                {
                    data: 'username',
                    width: '15%',
                    class: 'username'
                },
                {
                    data: 'name',
                    width: '70%',
                    class: 'name',
                },
            ],
            order: [[ 0, 'asc' ]],
        } );
        this.intervalWaitlist();
        return this.tableMounted;
    }
    async getWaitlist()
    {
        let results = await this.api.getWaitlist();
        if(!!results && results.s){
            this.data = results.s;
        }
    }
    async getDataWaitlist()
    {
        this.data = [];
        await this.getWaitlist();
        let dataMusics = [];
        let rowNumber = 1;
        this.data.forEach((ipt, idx) => {
            let result = main.payload.musics.filter(music => music.md5 === ipt[4]);
            if(result.length){
                dataMusics.push({
                    username: ipt[1],
                    name: result[0].name,
                    rowNumber: rowNumber,
                });
            }
            rowNumber++;
        });
        return dataMusics;
    }
    async intervalWaitlist()
    {
        if(getClassOptions().data.autoRefresh) {
            this.intervalRefresh = setInterval(async () => {
                $('#waitlistTimeleft').html(getClassWaitlist().secondsLeft);
                if (getClassWaitlist().secondsLeft <= 0) {
                    await getClassWaitlist().refreshData();
                    getClassWaitlist().secondsLeft = getClassOptions().data.autoRefresh;
                } else {
                    getClassWaitlist().secondsLeft--;
                }
            }, 1000);
        }
    }
    async resyncRefresh()
    {
        if(this.intervalRefresh) {
            clearInterval(this.intervalRefresh);
        }
        if(getClassOptions().data.autoRefresh) {
            $('#waitlistAutorefresh').removeClass('d-none');
        }else{
            $('#waitlistAutorefresh').addClass('d-none');
        }
        this.intervalWaitlist();
        this.forceRefresh();
    }
    async refreshData()
    {
        main.log('DEBUG', '[Waitlist] Refreshing data');
        await this.tableMounted.clear().draw();
        let dataMusics = await this.getDataWaitlist();
        await this.tableMounted.rows.add(dataMusics).draw();
        return true;
    }
    async forceRefresh()
    {
        this.secondsLeft = getClassOptions().data.autoRefresh;
        await this.refreshData();
        return true;
    }
    async addMusic(id)
    {
        let result = await this.api.addWaitlist(id, getClassProfile().data.id);
        if(!!result){
            this.forceRefresh();
            return true;
        }

        return false;
    }
}