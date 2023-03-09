mysql -u root -pUrPass -e "use database; SELECT * INTO OUTFILE '/tmp/output.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' FROM table;"
cat /tmp/table.csv

curl -o /dev/null -s -w "%{http_code}\n" -X POST \
    'http://localhost/api/import' \
    -H 'content-type: application/x-www-form-urlencoded' \
    --data-binary '@/tmp/table.csv'

sudo rm /tmp/table.csv

