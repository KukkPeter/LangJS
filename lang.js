/*
 *  LangJS | lang.js | Version v1.0.3
 *  
 *   Copyright 2022 Kukk Peter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// Simple and fast logging utility | Part of the LangJS object
function Log(message, type = "") { 
    switch(type) {
        case "warning":
            console.log(`%c[LangJS] %c${message}`, "color: #5865F2", "color: #FEE75C");
            break;
        case "info":
            console.log(`%c[LangJS] %c${message}`, "color: #5865F2", "color: #5ec4ff");
            break;
        case "error":
            console.error(`%c[LangJS] %c${message}`, "color: #5865F2", "color: #ED4245");
            break;
        case "success":
            console.log(`%c[LangJS] %c${message}`, "color: #5865F2", "color: #57F287");
            break;
        default:
            console.log(`%c[LangJS] %c${message}`, "color: #5865F2", "color: #fff");
            break;
    }
}

// Get every element of the page wich has and ID | Part of the LangJS object
function getIDs() {
    var ID = [];
    document.querySelectorAll('[id]').forEach(element => {
        ID.push(element.id);
    });
    ID.push("DocumentTitle");
    return ID;
}

// Exporting LangJS class
export class LangJS {
    constructor(path, languages, bypass) {
        // LangJS Settings
        this.Settings = {
            Initialized: false,
            Path: path,
            Version: "v1.0.3",
            StorageItem: 'LangJS-language',
            ID_Separator: '_',
            AttemptsToRetry: 3
        }

        // Set attempts number
        this.Attempts = 0;

        // Set bypass
        this.Bypass = bypass;

        // Set language array
        this.Languages = new Array();
        for (let i = 0; i < languages.length; i++) {
            this.Languages.push({language: languages[i], path: `${path}/${languages[i]}.json` });
        }

        // Set global variable
        window.LangJS = this;
        window.LangJS.Log = Log;
        window.LangJS.getIDs = getIDs;

        Log(`Script loaded successfully. | Waiting for initialization...`);
    }

    Init() {
        if(this.Settings.Initialized) {
            Log(`LangJS already initialized.`, 'error');
            return -2;
        } else {
            // Get recently used language from localStorage (if not available, set first language in this.Languages[] array)
            let language = null;
            if(localStorage.getItem(this.Settings.StorageItem) != null) {
                language = localStorage.getItem(this.Settings.StorageItem);
            } else {
                language = this.Languages[0].language;
                localStorage.setItem(this.Settings.StorageItem, language);
            }
    
            // Set initialized flag & Load language
            this.Settings.Initialized = true;

            if(this.Language(language) == -1) {
                Log(`There was an error during initialization.\nFile "${language}.json" cannot be found in ${this.Settings.Path}`, 'error');
                if(this.Attempts !== this.Settings.AttemptsToRetry) {
                    this.Attempts++;
                    if(this.Languages[0].language !== language) {
                        Log(`Because "${language}.json" isn't available, LangJS will load first available language[0]: ${this.Languages[0].language}\n\nAttempt: ${this.Attempts}`, 'error');
                        setTimeout(this.Language(this.Languages[0].language), 1000);
                    }
                    else {
                        Log(`Because "${language}.json" isn't available, LangJS will load second available language[1]: ${this.Languages[1].language}\n\nAttempt: ${this.Attempts}`, 'error');
                        setTimeout(this.Language(this.Languages[1].language), 1000);
                    }
                } else {
                    Log(`Tried to load language files ${this.Attempts} time without success. LangJS will have to re-initialize before using again.`, 'error');
                    this.Settings.Initialized = false;
                    return -1;
                }
            } else {
                Log(`Initialization finished. | Version: ${this.Settings.Version} | Current language: ${this.Language()}`, 'success');
            }

            return 0;
        }
    }

    // Language function | This function loads the file and sets the values on the document
    Language(language = null) {
        if(this.Settings.Initialized == true) {
            if(language == null) {
                // If 'language' argument is null, return current language
                return localStorage.getItem(this.Settings.StorageItem);
            } else {
                // If 'language' argument is not null, set language to localStorage & load language & return value
                // Get language entry
                var currentLanguage = this.Languages[this.Languages.findIndex(x => x.language == language)];
                
                if(currentLanguage == undefined || currentLanguage == "undefined") {
                    Log(`Language "${language}" isn't available.`, 'error');
                    return -1;
                } else {
                    // Fetch language path
                    fetch(currentLanguage.path)
                        .then(res => res.json())
                        .then(data => {
                            // File fetched successfully
                            // Load language
                            getIDs().forEach(element => {
                                if(this.Bypass.includes(element) == false) {
                                    if(element.includes(this.Settings.ID_Separator)) {
                                        // If element ID contains separator, then split and search for embedded JSON value
                                        var splittedElement = element.split(this.Settings.ID_Separator);
                                        if(splittedElement.length >= 11) {
                                            // Too large embedded key (Max: 10)
                                            Log(`ID Embedding too large. Up to 10 levels of ID embedding are possible. (ID: ${element})`, 'error');
                                        } else {
                                            // Load embedded values
                                            switch(splittedElement.length) {
                                                case 1:
                                                    // Error (1 length long is not possible)
                                                    Log(`Something just happend. Error with ID embedding switch: entered first case.`, 'error');
                                                    break;
                                                case 2:
                                                    var SC2 = data[splittedElement[0]][splittedElement[1]];
                                                    if(SC2 == undefined || SC2 == "undefined") 
                                                        Log(`IF-SC-2: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC2;
                                                    break;
                                                case 3:
                                                    var SC3 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]];
                                                    if(SC3 == undefined || SC3 == "undefined") 
                                                        Log(`IF-SC-3: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC3;
                                                    break;
                                                case 4:
                                                    var SC4 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]];
                                                    if(SC4 == undefined || SC4 == "undefined") 
                                                        Log(`IF-SC-4: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC4;
                                                    break;
                                                case 5:
                                                    var SC5 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]];
                                                    if(SC5 == undefined || SC5 == "undefined") 
                                                        Log(`IF-SC-5: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC5;
                                                    break;
                                                case 6:
                                                    var SC6 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]][splittedElement[5]];
                                                    if(SC6 == undefined || SC6 == "undefined") 
                                                        Log(`IF-SC-6: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC6;
                                                    break;
                                                case 7:
                                                    var SC7 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]][splittedElement[5]][splittedElement[6]];
                                                    if(SC7 == undefined || SC7 == "undefined") 
                                                        Log(`IF-SC-7: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC7;
                                                    break;
                                                case 8:
                                                    var SC8 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]][splittedElement[5]][splittedElement[6]][splittedElement[7]];
                                                    if(SC8 == undefined || SC8 == "undefined") 
                                                        Log(`IF-SC-8: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC8;
                                                    break;
                                                case 9:
                                                    var SC9 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]][splittedElement[5]][splittedElement[6]][splittedElement[7]][splittedElement[8]];
                                                    if(SC9 == undefined || SC9 == "undefined") 
                                                        Log(`IF-SC-9: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC9;
                                                    break;
                                                case 10:
                                                    var SC10 = data[splittedElement[0]][splittedElement[1]][splittedElement[2]][splittedElement[3]][splittedElement[4]][splittedElement[5]][splittedElement[6]][splittedElement[7]][splittedElement[8]][splittedElement[9]];
                                                    if(SC10 == undefined || SC10 == "undefined") 
                                                        Log(`IF-SC-10: Undefined key: ${element}`, 'error')
                                                    document.getElementById(element).innerHTML = SC10;
                                                    break;
                                                default:
                                                    // Default case if something happen.
                                                    Log(`Something just happend. Error with ID embedding switch: entered default case.`, 'error');
                                                    break;
                                            }
                                        }
                                    } else {
                                        if(element == "DocumentTitle") {
                                            // Set document title
                                            if(data[element] == undefined || data[element] == "undefined") 
                                                Log(`Document title isn't presented in "${language}.json" so it's skipped.\n\nIt can be also an error if title presented in "${language}.json".\nELSE-SC-0: Undefined key: ${element}`, 'info')
                                            else
                                                document.title = data["DocumentTitle"];
                                        } else {
                                            // Set values
                                            if(element != "adsbox") // During testing "adsbox" ID was always found -> By this if, "adsbox" ID skipped. (prevented)
                                                if(data[element] == undefined || data[element] == "undefined") 
                                                    Log(`ELSE-SC-1: Undefined key: ${element}`, 'error')
                                            
                                            // Set value of the element on the document
                                            document.getElementById(element).innerHTML = data[element];
                                        }
                                    }
                                }
                            });
                        })
                        .catch(error => {
                            // Get available languages
                            var AvailableLanguages = [];
                            this.Languages.forEach(element => {
                                if(element.language == language) 
                                    AvailableLanguages.push(`${element.language}(?)`);
                                else 
                                    AvailableLanguages.push(element.language);
                            });
                            
                            // Log fetch error
                            Log(`Fetch error. "${language}.json" isn't available in path: ${this.Settings.Path}.\nTry to use other available language or create "${language}.json" file in the proper path.\nAvailable languages: ${JSON.stringify(AvailableLanguages)}\n\nFETCH ERROR MESSAGE:\n${error}`,'error');
        
                            // Attempt to load other language
                            if(this.Attempts !== this.Settings.AttemptsToRetry) {
                                this.Attempts++;
                                if(this.Languages[0].language !== language) {
                                    Log(`Because "${language}.json" isn't available, LangJS will load first available language[0]: ${this.Languages[0].language}\n\nAttempt: ${this.Attempts}`, 'error');
                                    setTimeout(this.Language(this.Languages[0].language), 1000);
                                }
                                else {
                                    Log(`Because "${language}.json" isn't available, LangJS will load second available language[1]: ${this.Languages[1].language}\n\nAttempt: ${this.Attempts}`, 'error');
                                    setTimeout(this.Language(this.Languages[1].language), 1000);
                                }
                            } else {
                                Log(`Tried to load language files ${this.Attempts} time without success. LangJS will have to re-initialize before using again.`, 'error');
                                this.Settings.Initialized = false;
                            }
                        });
        
                    // Set localStorage value to the current & save
                    localStorage.setItem(this.Settings.StorageItem, language)
                    return localStorage.getItem(this.Settings.StorageItem);
                }

            }
        } else {
            Log(`LangJS is not initialized. Please call Init() function before using this feature.`, 'error');
            return `Error${this.Settings.ID_Separator}Init${this.Settings.ID_Separator}false`;
        }
    }

    // Get function | This function is an alias to Language function | NOTE: It only gets the current language
    Get() {
        // Return current language
        return this.Language();
    }

    // Use function | This function is an alias to Language function | NOTE: It only sets the language
    Use(language = null) {
        if(language == null) {
            // Return error because it only sets the language and cannot be used as a getter.
            return -1;
        } else {
            // Set & return language
            return this.Language(language);
        }
    }

    // Reload function | Reloads script and re-initialize
    Reload() {
        if(this.Settings.Initialized) {
            // Unload values from the document
            getIDs().forEach(element => {
                if(element != "DocumentTitle")
                    document.getElementById(element).innerHTML = "";
                else
                    document.title = "";
            });
    
            // Reset initialized flag
            this.Settings.Initialized = false;
    
            // Reset attempts number
            this.Attempts = 0;

            // Re-call init function
            this.Init();
    
            // Log success
            Log(`Script reloaded & Re-Initialized.`, 'info');
            return 0;
        } else {
            // Log error because script isn't initialized so cannot be reloaded.
            Log(`Cannot reload script because LangJS is not initialized. Please call Init() function before using this feature.`, 'error');
            return -1;
        }
    }
}
