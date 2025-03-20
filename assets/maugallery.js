(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
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

  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", function() {
      console.log("Précédent cliqué !");
      $.fn.mauGallery.methods.prevImage(options.lightboxId);
    });
    $(".gallery").on("click", ".mg-next", function() {
      console.log("Suivant cliqué !");
      $.fn.mauGallery.methods.nextImage(options.lightboxId);
    });
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = $("img.gallery-item").map(function() {
        return $(this).attr("src");
      }).get();

      let index = imagesCollection.indexOf(activeImage);
      if (index > 0) {
        $(".lightboxImage").attr("src", imagesCollection[index - 1]);
      } else {
        $(".lightboxImage").attr("src", imagesCollection[imagesCollection.length - 1]); // Revenir à la dernière image si on est au début
      }
    },

    nextImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = $("img.gallery-item").map(function() {
        return $(this).attr("src");
      }).get();

      let index = imagesCollection.indexOf(activeImage);
      if (index < imagesCollection.length - 1) {
        $(".lightboxImage").attr("src", imagesCollection[index + 1]);
      } else {
        $(".lightboxImage").attr("src", imagesCollection[0]); // Revenir à la première image si on est à la fin
      }
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
              <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : '<span style="display:none;" />'}
            </div>
          </div>
        </div>
      </div>`);
    },

    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
          <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      const $activeTag = $(".active-tag");
      if ($(this).is($activeTag)) return; // Si déjà actif, ne rien faire

      $activeTag.removeClass("active active-tag");
      $(this).addClass("active-tag");

      const tag = $(this).data("images-toggle");
      const $columns = $(".item-column");

      // Cache immédiatement les éléments sans animation
      $columns.css({ visibility: "hidden", opacity: 0 }).hide();

      requestAnimationFrame(() => {
        let $toShow = tag === "all" ? $columns : $columns.has(`[data-gallery-tag="${tag}"]`);

        // Affichage progressif avec délai
        $toShow.each(function(index) {
          // Ajouter un espace réservé pour l'image (hauteur minimum de la colonne)
          const $img = $(this).find("img");
          const imgHeight = $img.height() || 440; // Si l'image n'est pas encore chargée, on met une valeur par défaut (440px par exemple)

          // Applique l'animation sur chaque élément avec un délai de 0.1s entre chaque
          setTimeout(() => {
            $(this).css({ visibility: "visible", display: "block", minHeight: imgHeight + "px" })
              .animate({ opacity: 1 }, 500); // Animation fluide
          }, index * 80); // Délai de 0.08s entre chaque image

          // Gérer le chargement de l'image
          $img.on('load', function() {
            // Une fois l'image chargée, on met à jour la hauteur pour qu'elle corresponde exactement à l'image
            $(this).parents(".item-column").css('min-height', $(this).height());
          });
        });
      });
    }
  };
})(jQuery);
