# ui

User interface code for PCTNI

To download the data needed to run the app, run the following command in the terminal:

```bash
# list the releases in the pctni/ui repository
gh release list --repo pctni/ui
# download the specific release v2025-06 from the pctni/ui repository
gh release download pmtiles-data-v1.0
# Move the files into the _site directory:
mv -v *.pmtiles _site/
# Open the _site directory in quarto and run Go Live to preview the app
```