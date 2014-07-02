<?php
if (!defined('_PS_VERSION_'))
    exit;

class suggestions_prestashop extends Module
{
    public function __construct()
    {
        $this->name = 'suggestions_prestashop';
        $this->tab = 'checkout';
        $this->version = '1.0';
        $this->author = 'Human Factor Labs';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = array('min'=>'1.5', 'max'=>'1.6');
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('DaData Suggestions');
        $this->description = $this->l('Module that suggest addresses on checkout page via DaData.ru SaaS');

        $this->confirmUninstall = $this->l('Are you sure want to uninstall?');

    }

    public function install()
    {
        if (Shop::isFeatureActive())
            Shop::setContext(Shop::CONTEXT_ALL);

        if (!parent::install() ||
            !$this->registerHook('displayHeader') ||                               // Добавляем в заголовок CSS и JS
            !$this->registerHook('displayCustomerAccountForm') ||
            !Configuration::updateValue('DADATA_SUGGESTIONS_TOKEN','') ||
            !Configuration::updateValue('DADATA_SUGGESTIONS_COUNT',10) ||
            !Configuration::updateValue('DADATA_SUGGESTIONS_HIDE',true) ||
            !Configuration::updateValue('DADATA_SUGGESTIONS_TRIG_SEL_SPC',true))
            return false;
        return true;
    }

    public function uninstall()
    {
        if (!parent::uninstall() ||
            !Configuration::deleteByName('DADATA_SUGGESTIONS_TOKEN') ||
            !Configuration::deleteByName('DADATA_SUGGESTIONS_COUNT') ||
            !Configuration::deleteByName('DADATA_SUGGESTIONS_HIDE') ||
            !Configuration::deleteByName('DADATA_SUGGESTIONS_TRIG_SEL_SPC'))
            return false;
        return true;
    }

    protected function generateFIOScript($id) {
        $output = null;
        $output .= '    $("#firstname").parent().before(dadataSuggestions.generateInputHTML("'.$id.'","'.$this->l('Full Name').'"));';
        if (Configuration::get('DADATA_SUGGESTIONS_HIDE')==1) {
            $output .= '    $("#firstname").parent().attr("style","display: none !important");';
            $output .= '    $("#lastname").parent().attr("style","display: none !important");';
        }
        $output .= '    $("#sug-fio").suggestions({';
        $output .= '        serviceUrl: "https://dadata.ru/api/v2",';
        $output .= '        token: "'.strval(Configuration::get('DADATA_SUGGESTIONS_TOKEN')).'",';
        $output .= '        triggerSelectOnSpace: '.(Configuration::get('DADATA_SUGGESTIONS_TRIG_SEL_SPC')==1?'true':'false').',';
        $output .= '        count: '.(Configuration::get('DADATA_SUGGESTIONS_COUNT')>0?strval(Configuration::get('DADATA_SUGGESTIONS_COUNT')):'10').',';
        $output .= '        type: "NAME",';
        $output .= '        onSelect: function(suggestion) {dadataSuggestions.validateInputFIO(suggestion,"'.$id.'");}';
        $output .= '    });';
        return $output;
    }
    protected function generateAddressScript($id) {
        $output = null;
        $output .= '    $("#address1").parent().before(dadataSuggestions.generateInputHTML("'.$id.'","'.$this->l('Full Address').'"));';
        if (Configuration::get('DADATA_SUGGESTIONS_HIDE')==1) {
            $output .= '    $("#address1").attr("disabled",true);';
            $output .= '    $("#city").attr("disabled",true);';
            $output .= '    $("#id_country").attr("disabled",true);';
            $output .= '    $("#id_state").attr("disabled",true);';
            $output .= '    $("#postcode").attr("disabled",true);';
        }
        $output .= '    $("#'.$id.'").suggestions({';
        $output .= '        serviceUrl: "https://dadata.ru/api/v2",';
        $output .= '        token: "'.strval(Configuration::get('DADATA_SUGGESTIONS_TOKEN')).'",';
        $output .= '        triggerSelectOnSpace: '.(Configuration::get('DADATA_SUGGESTIONS_TRIG_SEL_SPC')==1?'true':'false').',';
        $output .= '        count: '.(Configuration::get('DADATA_SUGGESTIONS_COUNT')>0?strval(Configuration::get('DADATA_SUGGESTIONS_COUNT')):'10').',';
        $output .= '        type: "ADDRESS",';
        $output .= '        onSelect: function(suggestion) {dadataSuggestions.validateInputAddress(suggestion,"'.$id.'");}';
        $output .= '    });';
        return $output;

    }



    protected function wrapScriptOnLoad($script) {
        $output = null;
        $output .= '<script type="text/javascript">';
        $output .= '$(document).ready(function() {';
        $output .= $script;
        $output .= '});';
        $output .= '</script>';
        return $output;
    }


    public function getContent()
    {
        $output = null;

        if (Tools::isSubmit('submit' . $this->name)) {
            $dadata_token = strval(Tools::getValue('DADATA_SUGGESTIONS_TOKEN'));
            $dadata_count = strval(Tools::getValue('DADATA_SUGGESTIONS_COUNT'));
            $dadata_trig_sel_spc = strval(Tools::getValue('DADATA_SUGGESTIONS_TRIG_SEL_SPC'));
            $dadata_hide = strval(Tools::getValue('DADATA_SUGGESTIONS_HIDE'));
            if (!$dadata_token
                || empty($dadata_token)
                || !Validate::isSha1($dadata_token)
            )
                $output .= $this->displayError($this->l('Invalid').' '.$this->l('DaData.ru API Token'));
            elseif (!Validate::isBool($dadata_trig_sel_spc))
                $output .= $this->displayError($this->l('Invalid auto correct selection'));
            elseif (!Validate::isBool($dadata_hide))
                $output .= $this->displayError($this->l('Invalid hide selection'));
            elseif (!$dadata_count
                || empty($dadata_count)
                || !Validate::isUnsignedInt($dadata_count)
                || $dadata_count=='0'

            )
                $output .= $this->displayError($this->l('Invalid').' '.$this->l('Maximum suggestions count in list'));
            else {
                Configuration::updateValue('DADATA_SUGGESTIONS_TOKEN', $dadata_token);
                Configuration::updateValue('DADATA_SUGGESTIONS_COUNT', $dadata_count);
                Configuration::updateValue('DADATA_SUGGESTIONS_TRIG_SEL_SPC', $dadata_trig_sel_spc);
                Configuration::updateValue('DADATA_SUGGESTIONS_HIDE', $dadata_hide);
                $output .= $this->displayConfirmation($this->l('Settings updated'));
            }
        }
        return $output . $this->displayForm();
    }


    public function displayForm()
    {
        // Get default language
        $default_lang = (int)Configuration::get('PS_LANG_DEFAULT');

        // Init Fields form array
        $fields_form[0]['form'] = array(
            'legend' => array(
                'title' => $this->l('Settings'),
            ),
            'input' => array(
                array(
                    'type' => 'text',
                    'label' => $this->l('DaData.ru API Token'),
                    'name' => 'DADATA_SUGGESTIONS_TOKEN',
                    'size' => 50,
                    'required' => true
                ),
                array(
                    'type' => 'text',
                    'label' => $this->l('Maximum suggestions count in list'),
                    'name' => 'DADATA_SUGGESTIONS_COUNT',
                    'size' => 5,
                    'required' => true
                ),
                array(
                    'type' => 'radio',
                    'label' => $this->l('Automatic correction on input'),
                    'name' => 'DADATA_SUGGESTIONS_TRIG_SEL_SPC',
                    'required' => true,
                    'class' => 't',
                    'is_bool' => true,
                    'values' => array(
                        array(
                            'id' => 'active_on',
                            'value' => 1,
                            'label' => $this->l('Enabled')
                        ),
                        array(
                            'id' => 'active_off',
                            'value' => 0,
                            'label' => $this->l('Disabled')
                        )

                    )
                ),
                array(
                    'type' => 'radio',
                    'label' => $this->l('Disable address fields'),
                    'name' => 'DADATA_SUGGESTIONS_HIDE',
                    'required' => true,
                    'class' => 't',
                    'is_bool' => true,
                    'values' => array(
                        array(
                            'id' => 'active_on',
                            'value' => 1,
                            'label' => $this->l('Enabled')
                        ),
                        array(
                            'id' => 'active_off',
                            'value' => 0,
                            'label' => $this->l('Disabled')
                        )

                    )
                ),
            ),
            'submit' => array(
                'title' => $this->l('Save'),
                'class' => 'button'
            )
        );

        $helper = new HelperForm();

        // Module, token and currentIndex
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;

        // Language
        $helper->default_form_language = $default_lang;
        $helper->allow_employee_form_lang = $default_lang;

        // Title and toolbar
        $helper->title = $this->displayName;
        $helper->show_toolbar = true; // false -> remove toolbar
        $helper->toolbar_scroll = true; // yes - > Toolbar is always visible on the top of the screen.
        $helper->submit_action = 'submit' . $this->name;
        $helper->toolbar_btn = array(
            'save' =>
                array(
                    'desc' => $this->l('Save'),
                    'href' => AdminController::$currentIndex . '&configure=' . $this->name . '&save' . $this->name .
                        '&token=' . Tools::getAdminTokenLite('AdminModules'),
                ),
            'back' => array(
                'href' => AdminController::$currentIndex . '&token=' . Tools::getAdminTokenLite('AdminModules'),
                'desc' => $this->l('Back to list')
            )
        );

        // Load current value
        $helper->fields_value['DADATA_SUGGESTIONS_TOKEN'] = Configuration::get('DADATA_SUGGESTIONS_TOKEN');
        $helper->fields_value['DADATA_SUGGESTIONS_COUNT'] = Configuration::get('DADATA_SUGGESTIONS_COUNT');
        $helper->fields_value['DADATA_SUGGESTIONS_TRIG_SEL_SPC'] = Configuration::get('DADATA_SUGGESTIONS_TRIG_SEL_SPC');
        $helper->fields_value['DADATA_SUGGESTIONS_HIDE'] = Configuration::get('DADATA_SUGGESTIONS_HIDE');

        return $helper->generateForm($fields_form);
    }

    public function hookDisplayHeader() {
        $this->context->controller->addCSS('https://dadata.ru/static/css/suggestions-4.4.css','all');
        $this->context->controller->addJs('https://dadata.ru/static/js/jquery.suggestions-4.4.min.js','all');
        $this->context->controller->addJs($this->_path.'js/suggestions_prestashop.js', 'all');


    }

    public function hookDisplayCustomerAccountForm(){
        return $this->wrapScriptOnLoad($this->generateFIOScript('sug-fio').$this->generateAddressScript('sug-address'));
    }
}
