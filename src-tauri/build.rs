use cmake::Config;

fn main() {
    println!("cargo:rustc-env=MACOSX_DEPLOYMENT_TARGET=11.0");
    let dst = Config::new("../src-cpp").build();
    println!("cargo:rustc-link-search=native={}", dst.display());
    println!("cargo:rustc-link-search=native={}/lib", dst.display());
    println!("cargo:rustc-link-lib=static=backend");
    println!("cargo:rustc-link-lib=static=gecode-solver");
  
    // needed for gecode
    println!("cargo:rustc-link-lib=static=gecodekernel");
    println!("cargo:rustc-link-lib=static=gecodesupport");
    println!("cargo:rustc-link-lib=static=gecodedriver");
    println!("cargo:rustc-link-lib=static=gecodeint");
    println!("cargo:rustc-link-lib=static=gecodeset");
    println!("cargo:rustc-link-lib=static=gecodefloat");
    println!("cargo:rustc-link-lib=static=gecodesearch");
    println!("cargo:rustc-link-lib=static=gecodeminimodel");
    
    tauri_build::build()
}