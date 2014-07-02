var dadataSuggestions = {
    generateInputHTML: function (id,label) {
        var output = '<p class=\"required text\">';
        output += '<label for=\"'+ id +'\">'+ label +'<sup>*</sup></label>';
        output += '<input type=\"text\" id=\"'+ id +'\" class=\"text\">';
        output += '<span class=\"validity valid_blank\"></span>';
        output += '<span class=\"sample_text ex_blur\">&nbsp;</span>';
        output += '</p>';
        return output;
    },
    setValidField: function (id,valid) {
        if (valid) {
            $('#'+id).addClass('ok_field');
            $('#'+id+' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');

        }

    },
    validateInputAddress: function (suggestion,id) {
        if (suggestion.data.house) {
            $('#' + id).addClass('ok_field').removeClass('error_field');
            $('#' + id + ' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        } else {
            $('#' + id).removeClass('ok_field').addClass('error_field');
            $('#' + id + ' ~ .validity').removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
        }
        if (!suggestion.data.city && !suggestion.data.settlement){
            $('#city').val(suggestion.data.region).change().click();
        } else {
            $('#city').val((suggestion.data.city?suggestion.data.city_type + ' ' + suggestion.data.city:'') +
                (suggestion.data.settlement?' ' + suggestion.data.settlement_type + ' ' + suggestion.data.settlement:'')).change().click();
        }
        $('#id_country').val(this.getIdFromField('id_country',suggestion.data.country)).change().click();
        $('#address1').val($('#' + id).val()).change().click();
        $('#id_state').val(this.getIdFromField('id_state',suggestion.data.region)).change().click();
        $('#postcode').val(suggestion.data.postal_code).change().click();
        $('#city').addClass('ok_field').removeClass('error_field');
        $('#city ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        $('#id_country').addClass('ok_field').removeClass('error_field');
        $('#id_country ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        $('#address1').addClass('ok_field').removeClass('error_field');
        $('#address1 ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        $('#id_state').addClass('ok_field').removeClass('error_field');
        $('#id_state ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        $('#postcode').addClass('ok_field').removeClass('error_field');
        $('#postcode ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
//        console.log(suggestion.data);

    },
    validateInputFIO: function (suggestion,id) {
        if (suggestion.data.name && suggestion.data.surname) {
            $('#' + id).addClass('ok_field').removeClass('error_field');
            $('#' + id + ' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        } else {
            $('#' + id).removeClass('ok_field').addClass('error_field');
            $('#' + id + ' ~ .validity').removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
        }
        $('#firstname').val((suggestion.data.name?suggestion.data.name:'') + (suggestion.data.patronymic?' ' + suggestion.data.patronymic:''));
        $('#lastname').val((suggestion.data.surname?suggestion.data.surname:''));
    },
    getIdFromField: function (id, text) {
        return $('#' + id + ' option').filter(function () {return $(this).html().toLowerCase().search(text.toLowerCase())!=-1;}).val();
    }

}