{ inputs, ... }:

{
  perSystem = { inputs', self', lib, system, ... }: {
    packages.tags_test_dna =
      inputs.holochain-nix-builders.outputs.builders.${system}.dna {
        dnaManifest = ./dna.yaml;
        zomes = {
          # This overrides all the "bundled" properties for the DNA manifest
          tags_integrity = self'.packages.tags_integrity;
          tags = self'.packages.tags;
        };
      };
  };
}

