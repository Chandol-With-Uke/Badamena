FROM payara/micro:6.2024.5-jdk17
COPY target/jee-jaxrs-api.war /opt/payara/deployments/
EXPOSE 8080
CMD ["--deploy", "/opt/payara/deployments/jee-jaxrs-api.war", "--nocluster"]
