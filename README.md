# angular-pagination
Pagination directive using the angular

## Description
This is a directive that provides the pagination for the angular data. This is developed keeping certain characteristics in mind 
and they are listed below

- You are already experienced with angular js and directives
- You are using an API layer of java spring
- Leverages the pagination parameters of Java spring ( page.page and page.size )


## Usage
### HTML page
The pagination directive usage is as below:
```sh
<inpagination data-items-per-page="20" data-server-elements-per-page ="100"></inpagination>
```
- data-items-per-page : Number of items to be displayed in the view
- data-server-elements-per-page : Number of items per page to be returned from the api ( page.size )			            		

### Controller
The controller need to have the following methods defined in the scope.
```sh
  /**
  	 * This is the method called from the pagination directive to get the data from the server.
  	 * @param pageNumber : This is the page number to be fetched ( page.page in java api)
  	 * @param elementsPerPage : This is the items per page ( page.size in java api )
  	 * @param loadPageContentUpdateFn : This is a call back function to be called when the content is received 
  	 *
  	 */
  $scope.fetchPageableData = function(pageNumber,elementsPerPage,loadPageContentUpdateFn) {
  }
```

```sh
  // function called by inpageniation directive for setting
  // data for view
  $scope.setPagebleViewData = function(data) {
  
      $scope.customers = data;
  
      $scope.$apply();
  }
```

Additionally  if you want to have the content refreshed as a part of new search initiation, you can call the following method
```sh
$scope.refreshPageableList();
```


