{ inputs, ... }:

{
  perSystem = { inputs', system, ... }: {
    packages.tags_integrity =
      inputs.holochain-nix-builders.outputs.builders.${system}.rustZome {
        workspacePath = inputs.self.outPath;
        crateCargoToml = ./Cargo.toml;
      };
  };
}

