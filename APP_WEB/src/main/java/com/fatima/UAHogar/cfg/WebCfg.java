package com.fatima.UAHogar.cfg;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebCfg implements WebMvcConfigurer {
//Tratamiento de las rutas de las imagenes
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dirTrabajo = System.getProperty("user.dir");

        registry.addResourceHandler("/tareas/**")
                .addResourceLocations("file:" + dirTrabajo + "/uploads/tareas/");

        registry.addResourceHandler("/perfiles/**")
                .addResourceLocations("file:" + dirTrabajo + "/uploads/perfiles/");
        //Para Error.png
        registry.addResourceHandler("/recursos/**")
                .addResourceLocations("file:" + dirTrabajo + "/uploads/");
    }
}