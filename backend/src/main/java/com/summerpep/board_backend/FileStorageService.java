package com.summerpep.board_backend;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads/exports");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String saveFile(MultipartFile file, String username) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            Path userDirectory = rootLocation.resolve(username);
            if (!Files.exists(userDirectory)) {
                Files.createDirectories(userDirectory);
            }

            String originalFilename = file.getOriginalFilename();
            // Sanitize filename or append timestamp to prevent overwriting
            String filename = System.currentTimeMillis() + "_" + originalFilename;
            
            Path destinationFile = userDirectory.resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(userDirectory.toAbsolutePath())) {
                // Security check
                throw new RuntimeException("Cannot store file outside current directory.");
            }

            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public List<String> loadAllForUser(String username) {
        Path userDirectory = rootLocation.resolve(username);
        if (!Files.exists(userDirectory)) {
            return List.of();
        }

        try (Stream<Path> paths = Files.walk(userDirectory, 1)) {
            return paths
                    .filter(path -> !path.equals(userDirectory))
                    .map(userDirectory::relativize)
                    .map(Path::toString)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read stored files", e);
        }
    }

    public Resource loadFileAsResource(String username, String filename) {
        try {
            Path file = rootLocation.resolve(username).resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }
}
