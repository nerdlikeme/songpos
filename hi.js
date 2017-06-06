<script type="text/javascript" src="js/jquery-1.7.2-min.js"></script>
<script type="text/javascript" src="js/jsonpedia.js"></script>

var c = new JSONpedia();
    c.elastic().select('Albert Einstein', '@type : link', 1)
            .done(
                function (data) {
                    console.log('Loaded data: ' + data);
                }
            )
            .fail(
                function(err) {
                    console.error('Error while loading data: ' + err);
                }
            );