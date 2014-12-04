var dadataSuggestions = {
    configuration: {
        fio_fields: [
            {
                suggest_field: 'sug-fio',
                name: 'firstname',
                surname: 'lastname'
            },
            {
                suggest_field: 'sug-fio-customer',
                name: 'customer_firstname',
                surname: 'customer_lastname'
            },
            {
                suggest_field: 'sug-fio-invoice',
                name: 'customer_firstname',
                surname: 'customer_lastname'
            }


        ],
        addr_fields: [
            {
                suggest_field: 'sug-address',
                country: 'id_country',
                city: 'city',
                region: 'id_state',
                full_addr: 'address1',
                postcode: 'postcode'
            },
            {
                suggest_field: 'sug-address-invoice',
                country: 'id_country_invoice',
                city: 'city_invoice',
                region: 'id_state_invoice',
                full_addr: 'address1_invoice',
                postcode: 'postcode_invoice'
            }
        ],
        suggest_fio_label: 'Full Name',
        suggest_address_label: 'Full Address',
        DADATA_SUGGESTIONS_URL: '',
        DADATA_SUGGESTIONS_TOKEN: '',
        DADATA_SUGGESTIONS_TRIG_SEL_SPC: true,
        DADATA_SUGGESTIONS_COUNT: 10,
        DADATA_SUGGESTIONS_REGION_FIELD: 'id_state',
        DADATA_SUGGESTIONS_FIO: true,
        DADATA_SUGGESTIONS_ADDRESS: true
    },
    beforeSubmit: function (e) {
        var self = this;
        e.preventDefault();

        dadataSuggestions.configuration.fio_fields.forEach(function (value, index, a) {
            $("#" + value.name).parent().removeAttr("style");
            $("#" + value.surname).parent().removeAttr("style");

        });
        dadataSuggestions.configuration.addr_fields.forEach(function (value, index, a) {
            $("#" + value.full_addr).removeAttr("disabled");
            $("#" + value.city).removeAttr("disabled");
            $("#" + value.region).removeAttr("disabled");
            $("#" + value.postcode).removeAttr("disabled");
        });
        self.submit();
        return false; //is superfluous, but I put it here as a fallback

    },
    init: function () {
        var form_names = ['new_account_form', 'add_address'];
        form_names.forEach(function (value, index, a) {
            if ($("#" + value).length) {
                $("#" + value).submit(dadataSuggestions.beforeSubmit);
                var subName = $("#" + value + " :submit").attr("name");
                var subVal = $("#" + value + " :submit").val();
                if (subVal) $("#" + value).append('<input type="hidden" value="' + subVal + '" name="' + subName + '"></input>');
            }
        });
        if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_FIO)
            dadataSuggestions.configuration.fio_fields.forEach(function (value, index, a) {
                var nameEl = $("#" + value.name);
                if (nameEl.length && !$("#" + value.suggest_field).length) {
                    nameEl.parent().before(dadataSuggestions.generateInputHTML(value.suggest_field, dadataSuggestions.configuration.suggest_fio_label));
                    nameEl.parent().attr("style", "display: none !important");
                    $("#" + value.surname).parent().attr("style", "display: none !important");
                    $("#" + value.suggest_field).suggestions({
                        serviceUrl: dadataSuggestions.configuration.DADATA_SUGGESTIONS_URL,
                        token: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TOKEN,
                        triggerSelectOnSpace: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TRIG_SEL_SPC,
                        count: dadataSuggestions.configuration.DADATA_SUGGESTIONS_COUNT,
                        type: "NAME",
                        onSelect: function (suggestion) {
                            dadataSuggestions.validateInputFIO(suggestion, value);
                        }
                    });
                }

            });
        if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_ADDRESS)
            dadataSuggestions.configuration.addr_fields.forEach(function (value, index, a) {

                if ($("#" + value.full_addr).length && !$("#" + value.suggest_field).length) {
                    $("#" + value.full_addr).parent().before(dadataSuggestions.generateInputHTML(value.suggest_field, dadataSuggestions.configuration.suggest_address_label));
                    if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_REGION_FIELD == 'id_state') {
                        $("#" + value.country).change(dadataSuggestions.changeCountryHandler).change();
                    } else {
                        delete value.country;
                        value.region = dadataSuggestions.configuration.DADATA_SUGGESTIONS_REGION_FIELD;
                    }
                    $("#" + value.suggest_field).suggestions({
                        serviceUrl: dadataSuggestions.configuration.DADATA_SUGGESTIONS_URL,
                        token: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TOKEN,
                        triggerSelectOnSpace: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TRIG_SEL_SPC,
                        count: dadataSuggestions.configuration.DADATA_SUGGESTIONS_COUNT,
                        type: "ADDRESS",
                        onSelect: function (suggestion) {
                            dadataSuggestions.validateInputAddress(suggestion, value);
                        }
                    });
                }
            });

    },
    generateInputHTML: function (id, label) {
        var output = '<p class=\"required text\">';
        output += '<label for=\"' + id + '\">' + label + '<sup>*</sup></label>';
        output += '<input type=\"text\" id=\"' + id + '\" class=\"text\">';
        output += '<span class=\"validity valid_blank\"></span>';
        output += '<span class=\"sample_text ex_blur\">&nbsp;</span>';
        output += '</p>';
        return output;
    },
    setValidField: function (id, valid) {
        if (id instanceof Array) {
            id.map(function (data, index, array) {
                dadataSuggestions.setValidField(data, this);
                return data;
            }, valid);
        } else {
            var el1 = $('#' + id);
            var el2 = $('#' + id + ' ~ .validity');
            switch (valid) {
                case 1:
                    el1.addClass('ok_field').removeClass('error_field');
                    el2.addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
                    break;
                case 0:
                    el1.removeClass('ok_field').addClass('error_field');
                    el2.removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
                    break;
                default:
                    el1.removeClass('ok_field').removeClass('error_field');
                    el2.removeClass('valid_ok').addClass('valid_blank').removeClass('valid_nok');
                    break;
            }
        }

    },
    validateInputAddress: function (suggestion, addr_fields) {
        dadataSuggestions.setValidField(addr_fields.suggest_field, (suggestion.data.house ? 1 : 0));
        if (!suggestion.data.city && !suggestion.data.settlement) {
            $('#' + addr_fields.city).val(suggestion.data.region).change().click();
        } else {
            $('#' + addr_fields.city).val((suggestion.data.city ? suggestion.data.city_type + ' ' + suggestion.data.city : '') +
                (suggestion.data.settlement ? ' ' + suggestion.data.settlement_type + ' ' + suggestion.data.settlement : '')).change().click();
        }
        if (addr_fields.country) $('#' + addr_fields.country).val(dadataSuggestions.getIdFromField(addr_fields.country, suggestion.data.country)).change().click();
        $('#' + addr_fields.full_addr).val($('#' + addr_fields.suggest_field).val()).change().click();
        $('#' + addr_fields.region).val(dadataSuggestions.getIdFromField(addr_fields.region, suggestion.data.region)).change().click();
        $('#' + addr_fields.postcode).val(suggestion.data.postal_code).change().click().blur();
        dadataSuggestions.setValidField([addr_fields.city, addr_fields.country, addr_fields.full_addr, addr_fields.region, addr_fields.postcode], 1);
    },
    resetAddressFields: function () {
        dadataSuggestions.configuration.addr_fields.forEach(function (value, index, a) {
            dadataSuggestions.setValidField([value.city, value.country, value.full_addr, value.region, value.postcode], -1);
        });
    },
    validateInputFIO: function (suggestion, fio_fields) {
        dadataSuggestions.setValidField(fio_fields.suggest_field, (suggestion.data.name && suggestion.data.surname ? 1 : 0));
        $('#' + fio_fields.name).val((suggestion.data.name ? suggestion.data.name : '') + (suggestion.data.patronymic ? ' ' + suggestion.data.patronymic : '')).blur();
        $('#' + fio_fields.surname).val((suggestion.data.surname ? suggestion.data.surname : '')).blur();
    },
    getIdFromField: function (id, text) {
        return $('#' + id + ' option').filter(function () {
            return $(this).html().toLowerCase().search(text.toLowerCase()) != -1;
        }).val();
    },
    toggleAddressFields: function (isEnabled) {
        dadataSuggestions.configuration.addr_fields.forEach(function (value, index, a) {
            if (isEnabled) {
                $("#" + value.full_addr).attr("disabled", true);
                $("#" + value.city).attr("disabled", true);
                $("#" + value.region).attr("disabled", true);
                $("#" + value.postcode).attr("disabled", true);
                $("#" + value.suggest_field).removeAttr("disabled");
            } else {
                $("#" + value.full_addr).removeAttr("disabled");
                $("#" + value.city).removeAttr("disabled");
                $("#" + value.region).removeAttr("disabled");
                $("#" + value.postcode).removeAttr("disabled");
                $("#" + value.suggest_field).attr("disabled", true);
            }
        });
        dadataSuggestions.resetAddressFields();
    },
    changeCountryHandler: function (e) {
        dadataSuggestions.configuration.addr_fields.forEach(function (value, index, a) {
            if (value.country)
                dadataSuggestions.toggleAddressFields($('#' + value.country).val() == dadataSuggestions.getIdFromField(value.country, 'Россия'));
            else
                dadataSuggestions.toggleAddressFields(true);
        });
    }

}