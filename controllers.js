'use strict';

// Get the app reference
var app = angular.module("inspirenetz.controllers",[]);

// Define the controller
app.controller('com.inspirenetz.webapp.merchant.ListCustomerController', ['$scope','$http','inAPIAuthManager','inSessionManager','$window','growl','$location', function($scope,$http,inAPIAuthManager,inSessionManager,$window,growl,$location) {



	/**
	 * This is the method called from the pagination directive to get the data from the server.
	 * @param pageNumber : This is the page number to be fetched ( page.page in java api)
	 * @param elementsPerPage : This is the items per page ( page.size in java api )
	 * @param loadPageContentUpdateFn : This is a call back function to be called when the content is received 
	 *
	 */
    $scope.fetchPageableData = function(pageNumber,elementsPerPage,loadPageContentUpdateFn) {

       

        // URL for getting information
        var url = inAPIAuthManager.getPageableRequestUrl($scope.listcustomerurl,pageNumber,elementsPerPage);

        // Place the api request
        inAPIAuthManager.apiRequest('get',url,
            function(response) {

                // Check if the data is proper
                if( response.status == "success") {

                    // Call the call back function to updating the information with the data, and total elements
                    loadPageContentUpdateFn(response.data,response.totalelements);

                    // If there are no customers, then make the nocusfound to be visible
                    if ( $scope.customers.length == 0 ) {

                        $scope.nocusfound = true;

                    }
                    else
                    {
                        $scope.nocusfound = false;
                    }


                } else {

                    // Show a growl that not information was found
                    growl.addErrorMessage(inAPIAuthManager.getErrorDescription(response));


                }
         
                // Apply the changes to the scope
                $scope.$apply();

            },
            function(response) {

                // Show no customer message
                $scope.nocusfound = false;

                // Hide the dlginloadprogress
                $scope.hideInDlgProgress();

                // Show a growl that not information was found
                growl.addErrorMessage("No response from server!!");

            });
    }


    // function called by inpageniation directive for setting
    // data for view
    $scope.setPagebleViewData = function(data) {

        $scope.customers = data;

        $scope.$apply();
    }


    // You can call the following method of the directive from the controller to have the 
    // data refreshed. This is for clearing the data and refreshing the view when starting
    // a new search
    //     
    //   $scope.refreshPageableList();
    //

}])	;