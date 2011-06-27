$(document).ready(function () {
    $('#nickname_form').show();

    $('#nickname_form').submit(function () {
        $('#nickname_form').hide();
        $('#games_list').show();
        game.connect($('#nickname').val());

        return false;
    });
    
    $('#games_list').find('li').click(function () {
        $('#games_list').hide();
        $('#lobby').show();
    });
    
    $('#lobby').find('#start_game').click(function () {
        $('lobby').hide();
        game.start();
    });
});
