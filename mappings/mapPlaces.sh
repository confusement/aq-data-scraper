yarrrml-parser -i places.yml -o rules.rml.ttl
java -jar ./../lib/rmlmapper-4.9.3-r349-all.jar -m rules.rml.ttl -s turtle -o places.turtle