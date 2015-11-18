'use strict';

// Get the reference to the app
var app = angular.module("inspirenetz.directives",[]);

/**
 * Directive to show the paginator for the object
 *
 * @dependency  : refreshPageableList - Function to clear the pageable and variables
 *                                      This is called by the scope to reset the pagination
 *
 * @dependency  : fetchPageableData   - Function to get the pageable data from the scope
 *                                      This function is defined in the scope and accepts
 *                                      nextServerPage,serverElementsPerPage and the call back function
 *                                      for the paginator
 *
 * @dependency  : setPagebleViewData  - Function to set the current page data to be displayed for the view
 *                                      This function need to be implemented by the scope variable
 */
app.directive('inpagination',function() {

    return {

        restrict: 'E',
        replace:true,
        template: '<div id="inpaginator"></div>',
        link: function (scope, element, attrs) {



            // Pge number container
            var pageNumberContainer = $('<div id = "pageNumberContainer"></div>');

            // page links container
            var pageLinkContainer = $('<div>Page <b><span id = "currentPage"> 0 </span></b> of <b><span id ="totalPages"> 0 </span></b>:&nbsp; </div>');

            // Container holding the navigation buttons
            var navControlsContainer = $(element);

            // Set the current page in the UI to 0 intially
            var currentPage = 0 ;

            // Variable holding the current page in server
            // Set to 0 in start and before fetching, we need to incrmeent
            // it by 1
            // In java pagenumber 1 is 1, pagenumber =2 is 2 etch
            // reference:
            // http://blog.fawnanddoug.com/202012/05/pagination-with-spring-mvc-spring-data.html
            var currServerPage =0;

            // pages to fetch from the server in one shot
            var serverElementsPerPage=50;

            // Maximum records now in storage
            var maxRecords =0;

            // Numbers of items to display per page in the view
            var numPerPage = 20;

            // Total pages available ( this is the pages in the server)
            var totalPages = 0;


            // Array holding the data for the server.
            var pageData = [];


            // Check if the itemsPerPage attribute is set
            if ( attrs.itemsPerPage ) {

                numPerPage = parseInt(attrs.itemsPerPage) ;

            }


            // Check if the serverElementsPerPage is set
            if ( attrs.serverElementsPerPage ) {

                serverElementsPerPage = parseInt(attrs.serverElementsPerPage);

            }


            // Create the elements
            createElements();

            // Navigate to the current page
            gotoPage(currentPage);

            // Update the page links
            createPageLinks();


            // Function to refresh the list
            scope.refreshPageableList = function() {

                // Clear the pagedata
                pageData = [];

                // Set the currentPage to 0
                currentPage = 0;

                // Set the currserverpage to 0
                currServerPage = 0;

                // Set the totalPage
                totalPages = 0;

                // Set the maxRecords
                maxRecords = 0;

                // Hide all the button
                navControlsContainer.children().hide();

                // Hide all the links
                pageLinkContainer.hide();

                // Clear the content from the view
                scope.setPagebleViewData(pageData);

                // Call the gotoPage
                gotoPage(currentPage);
            }


            //
            // name: createElements
            //
            // Function to create the links and bind the events to the elements. It also adds the
            // elements to the navControlsContainer or the DOM object that invoked this plugin
            //
            function createElements() {

                // Create the button to move to the first Page
                var firstButton = createNavigationLink('button',  "First" )
                    .bind( "click" , function(e) {
                        currentPage=0;
                        gotoPage(currentPage);
                    });
                firstButton.appendTo(navControlsContainer);



                // Create the button to move to the previous Page
                var prevButton = createNavigationLink('button', "Prev" )
                    .bind( "click" , function(e) {
                        currentPage--;
                        gotoPage(currentPage);
                    });
                prevButton.appendTo(navControlsContainer);

                // Create the button to move to the next Page
                var nextButton = createNavigationLink('button',  "Next" )
                    .bind( "click" , function(e) {
                        currentPage++;
                        gotoPage(currentPage);
                    });
                nextButton.appendTo(navControlsContainer);

                // Create the button to move to the last Page
                var lastButton = createNavigationLink('button',  "Last" )
                    .bind( "click" , function(e) {
                        currentPage = Math.ceil(maxRecords/numPerPage)-1;
                        gotoPage(currentPage);
                    });
                lastButton.appendTo(navControlsContainer);

            }


            /**
             * name : createPageLinks
             *
             * This funciton will create the page number links for the pages.
             * It first creates a container that contains the page location and
             * the page numbers available.
             * Each page number link is bound to a function that will read the rel(pageNo) and
             * then move the content to that page using gotoPage() function.
             */
            function createPageLinks() {

                // Set the styling for the pageLinkContainer
                pageLinkContainer.css("width","300px");
                pageLinkContainer.css("height","20px");
                pageLinkContainer.css("float","right");
                pageLinkContainer.css("text-align","right");
                pageLinkContainer.css("margin-top","15px");
                pageLinkContainer.css("font-size","12px");


                pageNumberContainer.css("float","right");
                pageNumberContainer.css("margin-left","10px");


                // Append the pageNumberContainer to pageLinkContainer
                pageNumberContainer.appendTo(pageLinkContainer);
                // Finally append the pageLinkContainer to the navControlsContainer
                pageLinkContainer.appendTo(navControlsContainer);


                // Set the initial values for the currentPage
                // and the totalPages
                $('#currentPage').html(totalPages > 0 ? 1:0);
                $('#totalPages').html(totalPages);

            }

            //
            // name: createNavigationLink
            //
            // This function is used to create the navigation link for moving around the items
            // in the content container. It create a link type (button or anchor ), sets the
            // style details and the returns the reference to the link
            //
            // @param type  : The type of link, button = button type, link = anchor link
            // @param title : The title for the link ( value for the button )
            // @return reference to the button.

            function createNavigationLink( type, title ) {

                if( type == "button" ) {

                    var button = $("<input type =\"button\" id=\"" + title + "\"  value=\"" + title + "\"" +
                        " class = \"btn btn-primary btn-sm\"/>");

                    button.css( "margin" , "10px 5px 4px 0px");

                    return button;

                } else if ( type == "link") {

                    var button = $("<a href=\"#\" id=\"" + title + "\">" +title+"&nbsp;</a>");


                    button.css( "margin" , "10px 5px 4px 0px");

                    return button;

                }

            }


            /**
             * name: changePageNumbers
             *
             * This function changes the page numbers according to the current page selected.
             * Here the pageNumberContainer is emptied and after that the pageStart is set to the currentpage - 5
             * and page End to currentpage + 5
             *
             * Then it shows the links from pageStart to pageEnd
             */
            function changePageNumbers() {

                // Set the virtual page as physical page + 1
                var currPage = currentPage + 1;
                pageNumberContainer.html("");

                // Set the pageStart and the pageEnd parameters
                var pageStart = 1;
                var pageEnd = 0;

                // This is the element shown when there are more elements to the right / left
                var moreNumbers = $("<span>...&nbsp;&nbsp;</span>");


                // If the currentpage - 5 is greanter than 0, then there are more elements to left and
                // we only start from the currentpage - 5 positon
                // otherwise it will start from 1
                if( (currPage - 5) > 0 ) {

                    pageStart = currPage -  5;

                }

                // Setting the pageEnd
                // If currPage + 5 is greate than or requal to totalPages, we need to set pageEnd as totalPages
                // otherwise set the page end as currPage + 5 and there are more elements to right
                if ( (currPage + 5) >= totalPages )  {

                    pageEnd = totalPages;

                } else {

                    pageEnd =  (currPage+5);

                }

                // if pageStart is greater than 1, it means that we need to show the moreNumbers to left
                if(pageStart > 1) {

                    moreNumbers.appendTo(pageNumberContainer);

                }


                // Add the page numbers from the pageStart to pageEnd
                var pageNumber = "";
                for (var i = pageStart ; i <= pageEnd ; i++ ) {

                    // if adding the currentPage link, its added as a simple bold text
                    if ( currPage == i ) {

                        pageNumber = $("<b>"+i+"</b>");
                        pageNumber.css("margin-right","5px");

                    } else {

                        // Create a pageNumber of type anchor link and set the rel to virtual page number
                        // i.e, i -1.
                        pageNumber = $("<a  rel='"+(i-1)+"'>"+i+"</a>");
                        pageNumber.css("margin-right","5px");

                        // Bind the pageNumber to the pageNumberClick function.
                        pageNumber.bind("click",pageNumberClick);
                    }

                    // append the pageNumber object to the pageLinkContainer
                    pageNumber.appendTo(pageNumberContainer);
                }

                // if the pageEnd is less than totalPages, then we need to
                // show the moreElements to the right
                if( pageEnd < totalPages ) {

                    moreNumbers.appendTo(pageNumberContainer);

                }

            }

            /**
             * name : pageNumberClick
             *
             * This function is called when the page number link is clicked.
             * It will pass the eventObject for the click of the link.
             *
             * In the function we parse the virtual page number from the target's
             * rel attribute and then calls the gotoPage function
             *
             * @param:event - The event object passed to the function
             */
            function pageNumberClick(e) {

                // Get the pageNo by getting the rel attribute of the link throught e.target
                var pageNo = parseInt($(e.target).attr("rel"));


                //IMPORTANT: Set the current page marker to pageNo
                // IF this is not set, then the virtual marker would be out of sync and
                // the prev button will not work if we used the page links.
                currentPage = pageNo;

                // call the function to move to the specified page.
                gotoPage(pageNo);

            }


            /**
             * Callback function that is called when the controller finishes
             * fetching of data from the server
             * Controller will pass the json data array and the total number of
             * elements in the server for the query
             *
             * @param fetchData         - Json array containring the requested number of elements
             * @param totalElements     - Total elements in the server for the request ( if a query has 1000 elements, totalElements = 1000)
             *
             */
            function loadPageContentUpdateFn(fetchData,totalElements) {

                // If there is no data, then return and don't do anything
                if ( !fetchData  || fetchData.length == 0 ) {

                    return ;

                }

                // Add the fetchData.length to the maxRecords variable
                maxRecords += fetchData.length;

                // If the totalElements is not passed, then set it to maxRecords
                if ( !totalElements ) {

                    totalElements = maxRecords;

                }


                // Go through each of the object in the fetchData array
                // and add it to the pageData object
                for (var i = 0; i < fetchData.length ; i++ ) {

                    // Get the object
                    var obj = fetchData[i];

                    // Push it to the pageData object
                    pageData.push(obj);

                }

                // Set the total pages
                totalPages = Math.ceil(totalElements/numPerPage);


                // Set the total pages
                $("#totalPages").html(totalPages);

                // Show the pageNumberContainer
                pageNumberContainer.show();

                navControlsContainer.children().show();

                // Goto the current page
                gotoPage(currentPage);

            }


            //
            // name: gotoPage
            //
            // This function is used to change the view of the elements listed. It will change the
            // page of items as per the navigation variables. Each time if the currently viewed
            // contents are greater than or equal to the maximum records fetched, it will fetch
            // again.
            //
            // It works by slicing the hidden elements in the contents.
            //
            function gotoPage( currPage ) {

                // Check whether data need to be fetched
                if( ( ( currPage * numPerPage ) >= maxRecords  )
                    || maxRecords == 0 ) {

                    // Increment the currServerPage
                    currServerPage += 1;

                    // Call the fetchPageableData to get the next page of information
                    // from the server
                    scope.fetchPageableData(currServerPage,serverElementsPerPage, loadPageContentUpdateFn);

                    // Return the control here
                    // Now the controller need to call the loadContentFn call back
                    return;

                }


                // Identify the next offsets
                var startFrom = currPage * numPerPage;
                var endOn = startFrom + numPerPage;


                // Set the data for the scope
                scope.setPagebleViewData(pageData.slice(startFrom,endOn));

                // Get the reference to the next and previous buttons. These buttons will be shown
                // and hidden depending on the current page status
                var nextButton =  navControlsContainer.find('#Next');
                var prevButton =  navControlsContainer.find('#Prev');

                // Show both the button
                nextButton.show();
                prevButton.show();


                // If we are the first page, then hide the previous button
                if( currPage == 0 ) {

                    prevButton.hide();

                } else if ( currPage >= ( totalPages - 1 ) ) {

                    // If we are in the last page, then hide the next button.
                    nextButton.hide();

                }

                // If the maximum records fetched is less than or equal to the number of items
                // to be displayed per page, then no need to show the navigation controls
                if( maxRecords <= numPerPage ) {

                    navControlsContainer.children().hide();
                    pageLinkContainer.hide();
                }

                // Set the currentPage html value to the physical location of the page
                $('#currentPage').html((currPage+1));

                // update the page numbers according to current position
                changePageNumbers();
            }
        }

    }

});