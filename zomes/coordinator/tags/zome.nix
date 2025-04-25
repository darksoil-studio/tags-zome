{ inputs, ... }:

{
  perSystem = { inputs', system, self', ... }: {
    packages.tags =
      inputs.holochain-nix-builders.outputs.builders.${system}.rustZome {
        workspacePath = inputs.self.outPath;
        crateCargoToml = ./Cargo.toml;
      };

  };
}

