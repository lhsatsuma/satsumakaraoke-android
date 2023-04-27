var getClassGlobalMusics = null;

/**
 *
 * @returns {Musics}
 */
function getClassMusics()
{
    if(getClassGlobalMusics === null){
        getClassGlobalMusics = new Musics();
    }
    return getClassGlobalMusics;
}
class Musics
{
    async setTabContent()
    {
        await $('#nav-home').html(`
        <div class="container">
            <div class="col-12 text-center mb-5">
                <h5>Lista de Músicas</h5>
            </div>
            <table id="musicsTable" class="display w-100">
                <thead>
                    <tr>
                        <th data-name="codigo">Cod</th>
                        <th>Tipo</th>
                        <th>Nome</th>
                    </tr>
                </thead>
            </table>
        </div>
        <div class="modal fade" id="SelectedRowModal" tabindex="-1" role="dialog" aria-labelledby="SelectedRowModalLabel" style="padding-right: 5px;" aria-modal="true">
            <input type="hidden" id="IdInsertModal" />
            <input type="hidden" id="itsFavorite" />
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header"><h6 class="modal-title" id="SelectedRowModalLabel"></h6></div>
                    <div class="modal-body">
                        <div class="row margin-5">
                            <div class="col-12 mb-4 center">
                                <button type="button" id="InsertFilaBtn"
                                        class="btn btn-outline-success btn-rounded btn-bordered col-12" disabled>
                                    Colocar na fila
                                    <p class="error login-required" style="font-size: 0.8em">Necessário fazer o login</p>
                                </button>
                            </div>
                            <div class="col-12 mb-4 center">
                                <button type="button" id="InsertFavoriteBtn"
                                        class="btn btn-outline-info btn-rounded btn-bordered col-12"><i
                                        class="fas fa-star"></i> Favoritar
                                </button>
                            </div>
                        </div>
                        <div class="row margin-5">
                            <div class="col-12 primary-row center">
                                <button type="button" class="btn btn-outline-danger btn-bordered col-12"
                                        data-dismiss="modal">Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`);
        let langPTBR = new DataTableLangPTBR().getLang();
        let dataMusics = [];
        main.payload.musics.forEach((ipt, idx) => {
            dataMusics.push({
                id: ipt.id,
                codigo: ipt.codigo,
                tipo: ipt.tipo,
                name: ipt.name,
                fvt: 0,
            });
        });
        this.tableMounted = await $('#musicsTable').DataTable( {
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
        });

        $('#musicsTable').on('click', 'tbody tr', function () {
            let id = $(this).find('.codigo').data('id');
            let codigo = $(this).find('.codigo').text();
            let name = $(this).find('.name').text();
            $('#IdInsertModal').val(id);
            $('#SelectedRowModalLabel').html('['+codigo+'] '+name);
            $('#SelectedRowModal').modal('show');
        });
        $('#InsertFavoriteBtn').on('click', (e) => {
            $('#SelectedRowModal').modal('hide');
            if(getClassFavorites().addFavorite($('#IdInsertModal').val())) {
                Swal.fire({
                    toast: true,
                    position: 'bottom-end',
                    title: 'Música adicionada nos favoritos!',
                    text: '',
                    icon: 'success',
                    width: '400px',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
        $('#InsertFilaBtn').on('click', (e) => {
            $('#SelectedRowModal').modal('hide');
            if(getClassWaitlist().addMusic($('#IdInsertModal').val())) {
                Swal.fire({
                    toast: true,
                    position: 'bottom-end',
                    title: 'Música adicionada na fila!',
                    text: '',
                    icon: 'success',
                    width: '400px',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });

        return this.tableMounted;
    }
}