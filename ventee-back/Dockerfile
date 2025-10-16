# Utilisation d'une image GlassFish compatible avec Java 17
FROM glassfish/server:6.2.5-jdk17

# Met à jour les paquets et installe wget
RUN apt-get update && apt-get install -y wget

# Définition des variables d'environnement par défaut
ENV DB_HOST=postgresql \
    DB_PORT=5432 \
    DB_NAME=ventee \
    DB_USER=boywithuke \
    DB_PASSWORD=bankai \
    REDIS_HOST=redis \
    REDIS_PORT=6379 \
    REDIS_URI="redis://redis:6379"

# Copie de l'artefact WAR dans le dossier d'autodeploy de GlassFish
COPY target/ventee-1.0-SNAPSHOT.war $GLASSFISH_HOME/glassfish/domains/domain1/autodeploy/

# Téléchargement et installation du pilote PostgreSQL JDBC
# La version doit correspondre à celle du pom.xml (42.7.2)
RUN wget https://jdbc.postgresql.org/download/postgresql-42.7.2.jar -P $GLASSFISH_HOME/glassfish/domains/domain1/lib/

# Copie du script de configuration GlassFish
COPY glassfish-setup.sh /tmp/glassfish-setup.sh
RUN chmod +x /tmp/glassfish-setup.sh

# Exécution du script de configuration lors du démarrage du conteneur
# Ensuite, démarre le domaine et affiche les logs pour garder le conteneur actif et visible.
CMD ["/bin/bash", "-c", "/tmp/glassfish-setup.sh && asadmin start-domain && tail -F $GLASSFISH_HOME/glassfish/domains/domain1/logs/server.log"]
