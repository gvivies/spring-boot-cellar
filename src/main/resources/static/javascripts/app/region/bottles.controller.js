//=require_self

(function () {

    'use strict';

    angular.module('bottles.controller', [])
        .controller('BottlesCtrl', BottlesCtrl);

    BottlesCtrl.$inject = ['$scope', 'CrudService', 'Constants', 'FormService', 'UtilService', '$mdDialog', 'ConfirmService'];

    function BottlesCtrl($scope, CrudService, Constants, FormService, UtilService, $mdDialog, ConfirmService) {

        var viewModel = this,
            listWines = [],
            listWineries = [],
            listClassifications = [],
            formLists = [];
        // --- Handler functions 

        function createItemHandler() {
            FormService.showForm($scope, {}, viewModel.formSettings);
        }

        function editItemHandler(item) {
            FormService.showForm($scope, UtilService.clone(item), viewModel.formSettings);
        }

        function onCreatedItemEventHandler(event, item) {
            viewModel.items.push(item);
            $scope.$emit(Constants.DISPLAY_MSG_EVENT, "Les bouteilles " + item.name + " ont été créées avec succès");
        }

        function onUpdatedItemEventHandler(event, item) {
            var idx = UtilService.getIndex(item.id, viewModel.items);
            if (idx >= 0) {
                viewModel.items[idx] = item;
            }
            $scope.$emit(Constants.DISPLAY_MSG_EVENT, "Les bouteilles " + item.name + " ont été modifiées avec succès");
        }

        function deleteItemHandler(item) {

            function removeItem() {

                function onRemoveError() {
                    $scope.$emit(Constants.DISPLAY_MSG_EVENT, "Une erreur est survenue lors de la suppression de " + item.name);
                }

                function onRemoveSuccess() {
                    var itemList = $scope.ctrl.items,
                        idx = itemList.indexOf(item);
                    itemList.splice(idx, 1);
                    $scope.$emit(Constants.DISPLAY_MSG_EVENT, "La suppression de " + item.name + " a été effectuée avec succès");
                }

                CrudService.resource(Constants.BOTTLES_URI + '/' + item.id)
                    .remove(onRemoveSuccess, onRemoveError);
            }

            ConfirmService.confirmDelete(item, 'les bouteills')
                .then(removeItem);
        }

        // --- Attaching functions and events handler

        viewModel.editItem = editItemHandler;
        viewModel.createItem = createItemHandler;
        viewModel.deleteItem = deleteItemHandler;

        $scope.$on(Constants.CREATED_ITEM_EVENT, onCreatedItemEventHandler);
        $scope.$on(Constants.UPDATED_ITEM_EVENT, onUpdatedItemEventHandler);

        // --- On load

        function loadClassifications(listClassifications) {
            formLists.push({
                'name': 'classifications',
                'content': listClassifications
            });
        }

        function loadWineries(listWineries) {
            formLists.push({
                'name': 'wineries',
                'content': listWineries
            });
            CrudService.resource(Constants.CLASSIFICATIONS_URI).list(loadClassifications);
        }

        function loadWines(listWines) {
            formLists.push({
                'name': 'wines',
                'content': listWines
            });
            CrudService.resource(Constants.WINERIES_URI).list(loadWineries);
        }

        function loadAllOtherLists() {
            CrudService.resource(Constants.WINES_URI).list(loadWines);
        }

        viewModel.items = CrudService.resource(Constants.BOTTLES_URI).list(loadAllOtherLists);

        viewModel.formSettings = {
            size: "xxl",
            template: "bottle.html",
            uri: Constants.BOTTLES_URI,
            lists: formLists
        };

    }

}());