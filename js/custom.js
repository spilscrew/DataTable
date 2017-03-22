//Get Data
var getData = {
    settings: {
        requestUrl: 'sampleData.json',
        requestInterval: false,
        appendedElement: '.table',
    },
    request: function () {
        $.ajax({
            url: this.settings.requestUrl,
            dataType: 'json',
            success: function (data, status) {
                if (JSON.stringify(data) !== JSON.stringify(getData.settings.data)) {
                    getData.settings.data = data;
                    renderData.init(data, status, getData.settings.appendedElement);
                }
            },
            error: function (obj, status) {
                renderData.init(obj, status, getData.settings.appendedElement);
            }
        });
    },
    requestInterval: function (requestInterval) {
        if (requestInterval) {
            var interval = setInterval(function () {
                getData.request();
            }, requestInterval);
            $('.feed_control').click(function () {
                if ($(this).hasClass('pause')) {
                    $(this).toggleClass('pause', false);
                    $(this).toggleClass('play', true);
                    clearInterval(interval);
                } else if ($(this).hasClass('play')) {
                    $(this).toggleClass('play', false);
                    $(this).toggleClass('pause', true);
                    interval = setInterval(function () {
                        getData.request();
                    }, requestInterval);
                }
            })
        } else {
            $(".feed_control, .feed_control_name").hide();
        }
        ;
    },
    init: function (requestUrl, requestInterval, appendedElement) {
        requestUrl ? this.settings.requestUrl = requestUrl : this.settings.requestUrl;
        requestInterval ? this.settings.requestInterval = requestInterval : this.settings.requestInterval;
        appendedElement ? this.settings.appendedElement = appendedElement : this.settings.appendedElement;
        getData.request();
        getData.requestInterval(requestInterval);
    }
};

//Render Data
var renderData = {
    init: function (data, status, element) {
        if (status === 'success') {
            this.renderTemplate.success(data, element);
            $(this.settings.expandableClass).click(function () {
                renderData.expandable(this);
                saveData.init("expand", $(this).parent());
            });
            $(this.settings.buttonSearchClass).click(function () {
                renderData.search();
            });
        } else {
            this.renderTemplate.error(data, element);
        }
    },
    settings: {
        expandableClass: '.expandable',
        buttonSearchClass: '.search',
        inputSearchClass: '.input_search',
        messageCell: ''
    },
    expandable: function (that) {
        $(that).toggleClass('active');
    },
    search: function () {
        var inputValue = $(this.settings.inputSearchClass).val().toLowerCase();
        $.each($('td.message'), function (index, value) {
            value = $(value).text().toLowerCase();
            var text = value.search(inputValue);
            if (text > -1) {
                $(this).parent().addClass('show skip').removeClass('hide');
            } else {
                $(this).parent().addClass('hide').removeClass('show skip');
            }
        });
        $.each($('td.context'), function (index, value) {
            value = $(value).text().toLowerCase();
            var text = value.search(inputValue);
            if (text > -1 || $(this).parent().hasClass('skip')) {
                $(this).parent().addClass('show').removeClass('hide');
            } else {
                $(this).parent().addClass('hide').removeClass('show');
            }
            $(this).parent().removeClass('skip');
        });
    },
    filters: {
        init: $('.filter').on('change', function () {
            $(renderData.settings.inputSearchClass).val(null);
            renderData.filters.filterData.value = $(this).val().toLowerCase();
            renderData.filters.filterData.select = Object.keys($(this).data())[0];
            if (renderData.filters.filterData.value === 'no filter') {
                renderData.filters.filterData.activeFilters[renderData.filters.filterData.select] = '';
                renderData.filters.filterData.multipleFlag = false;
            } else {
                renderData.filters.filterData.activeFilters[renderData.filters.filterData.select] = renderData.filters.filterData.value;
            }
            renderData.filters.filter();
        }),
        filterData: {
            value: '',
            select: '',
            activeFilters: {
                level: '',
                service: ''
            },
            multipleFlag: false
        },
        filter: function () {
            var selectValue = renderData.filters.filterData.value;
            var select = renderData.filters.filterData.select;
            var activeFilters = renderData.filters.filterData.activeFilters;
            var multipleFlag = renderData.filters.filterData.multipleFlag;
            var multipleFilters = false;

            $.each(activeFilters, function (index, value) {
                if (!value) {
                    multipleFilters = false;
                    return false;
                } else {
                    multipleFilters = true;
                }
            });

            $.each($(getData.settings.appendedElement + ' tr:not(:first-child)'), function () {
                var that = this;
                var elementData = $(this).data(select);
                if (elementData != undefined) {
                    elementData = $(this).data(select).toLowerCase();
                }

                if (!multipleFlag) {
                    if (multipleFilters) {
                        if (!$(this).hasClass('hide')) {
                            if (selectValue === elementData) {
                                $(this).addClass('show').removeClass('hide');
                            } else {
                                $(this).addClass('hide').removeClass('show');
                            }
                        }
                        renderData.filters.filterData.multipleFlag = true;
                    } else {
                        $(this).addClass('hide').removeClass('show');
                        if (selectValue === elementData) {
                            $(this).addClass('show').removeClass('hide');
                        }
                        if (selectValue === 'no filter' || selectValue === '') {
                            var nullFilter = true;
                            $.each(activeFilters, function (index, value) {
                                if (value === $(that).data(index).toLowerCase()) {
                                    $(that).addClass('show').removeClass('hide');
                                }
                                ;
                                if (value.length > 0) {
                                    nullFilter = false;
                                }
                            });
                            if (nullFilter) {
                                $(this).addClass('show').removeClass('hide');
                            }
                        }
                        ;
                    }
                } else {
                    var that = this;
                    var flag = true;
                    $.each(activeFilters, function (index, value) {
                        if ($(that).data(index).toLowerCase() !== value) {
                            flag = false;
                            $(that).addClass('hide').removeClass('show');
                        }
                    });
                    if (flag) {
                        $(that).addClass('show').removeClass('hide');
                    }
                }
            });
        },
    },
    renderTemplate: {
        success: function (data, element) {
            var counter = 1;
            var template = '<table><tbody><colgroup>';
            $.each(Object.keys(data.data[0]), function () {
                template += '<col>';
            });
            template += '</colgroup><tr>';
            $.each(Object.keys(data.data[0]), function (index, value) {
                template += '<th class=' + value + '>' + value + '</th>';
                if (value === 'message') {
                    renderData.settings.messageCell = index;
                }
            });
            template += '</tr>';
            $.each(data.data, function (index, value) {
                index = data.data.length - counter;
                template += '<tr data-level=' + data.data[index].level + ' data-service=' + data.data[index].service + '>';
                $.each(Object.values(data.data[index]), function (index, value) {
                    if (typeof value === 'object') {
                        template += '<td class="context expandable">';
                        $.each(Object(value), function (index, value) {
                            template += '<div>';
                            template += '<span class="index">' + index + '</span>';
                            template += '<span class="value">' + value + '</span>';
                            template += '</div>';
                        });
                        template += '</td>';
                    } else if (value === "debug" || value === "error" || value === "info" || value === "warning") {
                        template += '<td><div class="level-blck ' + value + '">' + value + '</div></td>';
                    } else if (index === renderData.settings.messageCell) {
                        template += '<td class="message">' + value + '</td>';
                    } else {
                        template += '<td>' + value + '</td>';
                    }
                });
                template += '</tr>';
                counter += 1;
            });
            template += '</tbody></table>';
            $(element).html(template);
            renderData.setSaveData(element, template);
            renderData.filters.filter();
            if ($(renderData.settings.inputSearchClass).val().length > 0) {

            }
        },
        error: function (data, element) {
            if ($(getData.settings.appendedElement + ' .error404').length < 1) {
                $(getData.settings.appendedElement).append('<div class="error404">' + data.status + ' | ' + data.statusText + '</div>');
            }
        }
    },
    setSaveData: function (element, template) {
        $.each(saveData.storage, function (index, value) {
            $('*:contains(' + value.expand + ')').children().last().addClass("active");
        });
    }
};

//Save Data
var saveData = {
    init: function (type, data) {
        if (type === 'expand') {
            data = $(data).children().first().text();
            this.storageController(type, data);
        }
    },
    storageController: function (type, data) {
        var item = {};
        var flag = false;
        item[type] = data;
        $.each(this.storage, function (index, value) {
            if (JSON.stringify(item) === JSON.stringify(value)) {
                saveData.storage.splice(index, 1);
                flag = true;
            }
        });
        if (!flag) {
            this.storage.push(item);
        }
        ;
    },
    storage: []
}

//Select2 init
$('select').select2({
    minimumResultsForSearch: -1,
    templateResult: function (data, container) {
        if (data.element) {
            $(container).addClass($(data.element).attr('class'));
        }
        return data.text;
    }
});
