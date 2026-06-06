import sys
import os

print("Python version:", sys.version)

try:
    import pytesseract
    print("pytesseract is installed.")
except ImportError:
    print("pytesseract is NOT installed.")

try:
    import easyocr
    print("easyocr is installed.")
except ImportError:
    print("easyocr is NOT installed.")

try:
    import google.generativeai as genai
    print("google.generativeai is installed.")
except ImportError:
    print("google.generativeai is NOT installed.")

# Let's list packages
import pkg_resources
installed_packages = [d.project_name for d in pkg_resources.working_set]
print("Installed packages count:", len(installed_packages))
if "pytesseract" in installed_packages or "easyocr" in installed_packages:
    print("OCR packages are present.")
