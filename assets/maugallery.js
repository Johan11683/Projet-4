(function($) {
  $.fn.mauGallery = function(options) {
    const settings = $.extend($.fn.mauGallery.defaults, options);
    const tagsCollection = [];
    return this.each(function() {
      const $gallery = $(this);

      $.fn.mauGallery.methods.createRowWrapper($gallery);

      if (settings.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $gallery,
          settings.lightboxId,
          settings.navigation
        );
      }

      $.fn.mauGallery.listeners(settings);

      $gallery.children(".gallery-item").each(function() {
        const $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, settings.columns);
        const theTag = $item.data("gallery-tag");

        if (settings.showTags && theTag && !tagsCollection.includes(theTag)) {
          tagsCollection.push(theTag);
        }
      });

      if (settings.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $gallery,
          settings.tagsPosition,
          tagsCollection
        );
      }

      $gallery.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(settings) {
    $(".gallery-item").on("click", function() {
      if (settings.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), settings.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(settings.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(settings.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper($gallery) {
      if (!$gallery.children().first().hasClass("row")) {
        $gallery.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn($item, columns) {
      let columnClass = '';
      if (typeof columns === 'number') {
        columnClass = `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === 'object') {
        Object.keys(columns).forEach(size => {
          columnClass += ` col-${size}-${Math.ceil(12 / columns[size])}`;
        });
      }
      $item.wrap(`<div class='item-column mb-4 ${columnClass}'></div>`);
    },
    moveItemInRowWrapper($item) {
      $item.appendTo(".gallery-items-row");
    },
    responsiveImageItem($item) {
      if ($item.prop("tagName") === "IMG") {
        $item.addClass("img-fluid");
      }
    },
    openLightBox($item, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", $item.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = $("img.gallery-item").map(function() {
        return $(this).attr("src");
      }).get();
      let index = imagesCollection.indexOf(activeImage);
      let nextIndex = index > 0 ? index - 1 : imagesCollection.length - 1;
      $(".lightboxImage").attr("src", imagesCollection[nextIndex]);
    },
    nextImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = $("img.gallery-item").map(function() {
        return $(this).attr("src");
      }).get();
      let index = imagesCollection.indexOf(activeImage);
      let nextIndex = index < imagesCollection.length - 1 ? index + 1 : 0;
      $(".lightboxImage").attr("src", imagesCollection[nextIndex]);
    },
    createLightBox($gallery, lightboxId, navigation) {
      $gallery.append(`
        <div class="modal fade" id="${lightboxId || "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;">&lt;</div>' : ''}
                <img class="lightboxImage img-fluid" alt=""/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;">&gt;</div>' : ''}
              </div>
            </div>
          </div>
        </div>
      `);
    },
    showItemTags($gallery, position, tags) {
      let tagItems = `<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>`;
      tags.forEach(tag => {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
      });
      const tagsRow = `<ul class="tags-bar nav nav-pills">${tagItems}</ul>`;
      position === "top" ? $gallery.prepend(tagsRow) : $gallery.append(tagsRow);
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) return;

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      const tag = $(this).data("images-toggle");
      $(".gallery-item").each(function() {
        const $item = $(this);
        const $parentColumn = $item.parents(".item-column");
        if (tag === "all" || $item.data("gallery-tag") === tag) {
          $parentColumn.show();
        } else {
          $parentColumn.hide();
        }
      });
    }
  };
})(jQuery);
