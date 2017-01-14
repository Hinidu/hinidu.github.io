(function($) {
  $(document).ready(function() {
    $(".tabs-container").each(function() {
      var tabsContainer = $(this);
      var tabsMenu = tabsContainer.find(".tabs-menu");
      var tabContents = tabsContainer.find(".tab-content");

      tabContents.each(function() {
        var tabContent = $(this);
        var tabTitle = tabContent.attr("title");
        var tabLink = $("<li><a href='#'>" + tabTitle + "</a></li>");
        tabLink.click(function(event) {
          event.preventDefault();
          tabLink.siblings().removeClass("current");
          tabLink.addClass("current");
          tabContent.siblings(".tab-content").css("display", "none");
          tabContent.fadeIn();
        });
        tabsMenu.append(tabLink);
      });

      tabsMenu.children().first().addClass("current");
      tabContents.first().css("display", "block");
    });
  });
})(jQuery);
