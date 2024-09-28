export interface IOable {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
}

export interface Transportable<D, P> {
  perform_job_from(config_file: string, job_name: string): void;
  perform_job(job_parameter: P): void;
  transform_and_write(
    source_file: string,
    job_parameter: P,
    md_content: D
  ): void;
}

export interface Transformable {

}

export interface Mappable {
  
}