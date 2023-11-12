# Better FS ModHub

![image](https://github.com/Dixeet/better-fs-modhub/assets/6210428/2afb3b62-8634-4496-9951-31c17bca424f)

Better Fs Modhub is a script for [FS Modhub website](https://www.farming-simulator.com/mods.php?lang=en&country=gb&sort=default) to improve browsing and exploring FS Mods and their categories.

## Features

- Sort by most downloaded
- Sort alphabetically
- Improved search into a category
- Categories list sorted alphabetically

## Install

You need to have [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) or [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (Chrome based) browser extension. Once installed, you can either :

- copy the content of https://github.com/Dixeet/better-fs-modhub/blob/main/dist/better-fs-modhub.user.js into a new script
- or directly access this [link](https://github.com/Dixeet/better-fs-modhub/raw/main/dist/better-fs-modhub.user.js) which should ask you to add the script

Visit [FS Modhub website](https://www.farming-simulator.com/mods.php?lang=en&country=gb&sort=default) and make sure the script is enabled. Once enabled, you can reload the page and you should now see a new menu below the default modhub menu.

## Usage

To prevent too much stress on FS website, the script is "activated" only when you have selected a category. Which means for example that for "Latest" or "Top Downloaded" you wont be able to sort or use the improved search.
For the same reason, each category is parse automatically only once when you first visit the category then is cached into the browser storage. If you want to update the category, to refresh the list with new mods or if you have changed the language, you will have to manually update it by clicking on ` ⟳ ` button.

The first three left tabs :

- MODHUB : is the default modhub sorting view (which I think is latest for the category)
- TOP : Sort by most downloaded mods by descending order
- A-Z : Sort alphabetically by ascending order

The searchbar is only available if you have selected either TOP or A-Z sort. It will search through all mods names in the selected category, and if you enter multiple words, each words must be present in the name. The result will be sorted by the one you had chosen.

The CATEGORIES, is the categories list but sorted alphabetically. It will also show you the current selected category name.

The ` ⟳ ` allows you to refresh the mods list for the selected category in case you want to update with the last added mods or you have changed the language selected for example.
