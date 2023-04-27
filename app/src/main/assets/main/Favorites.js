var getClassGlobalFavorites = null;

/**
 *
 * @returns {Favorites}
 */
function getClassFavorites()
{
    if(getClassGlobalFavorites === null){
        getClassGlobalFavorites = new Favorites();
    }
    return getClassGlobalFavorites;
}
class Favorites{
    data = [];
    tableMounted = null;
    constructor() {
        if(storage.get('savedFavorites')) {
            this.data = storage.get('savedFavorites');
        }
    }
    addFavorite(id)
    {
        if(!id){
            return false;
        }
        if(this.data.indexOf(id) != -1){
            return true;
        }
        let dataMusics = [];
        let result = main.payload.musics.filter(music => music.id === id);
        if(result.length){
            dataMusics.push({
                id: result[0].id,
                codigo: result[0].codigo,
                tipo: result[0].tipo,
                name: result[0].name,
            });
        }
        this.tableMounted.rows.add(dataMusics).draw();
        this.data.push(id);
        return this.saveStorage();
    }
    saveStorage()
    {
        storage.save('savedFavorites', this.data);
        return true;
    }
    async setTabContent()
    {
        await $('#nav-favorites').html(`<div class="container">
            <div class="col-12 text-center mb-5">
                <h5>Favoritos</h5>
            </div>
            <table id="favoritesTable" class="display w-100">
                <thead>
                <tr>
                    <th data-name="codigo">Cod</th>
                    <th>Tipo</th>
                    <th>Nome</th>
                </tr>
                </thead>
            </table>
        </div>`);

        let langPTBR = new DataTableLangPTBR().getLang();
        let dataMusics = [];
        this.data.forEach((id, idx) => {
            let result = main.payload.musics.filter(music => music.id === id);
            if(result.length){
                dataMusics.push({
                    id: result[0].id,
                    codigo: result[0].codigo,
                    tipo: result[0].tipo,
                    name: result[0].name,
                });
            }
        });
        this.tableMounted = await $('#favoritesTable').DataTable( {
            language: langPTBR,
            lengthChange: false,
            data: dataMusics,
            iDisplayLength: 50,
            autoWidth: false,
            columns: [
                {
                    data: 'codigo',
                    width: '15%',
                    class: 'codigo',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('data-id', rowData.id);
                    }
                },
                {
                    data: 'tipo',
                    width: '15%',
                    class: 'tipo'
                },
                {
                    data: 'name',
                    width: '70%',
                    class: 'name',
                },
            ],
            order: [[ 2, 'asc' ]],
        } );
        return this.tableMounted;
    }
}