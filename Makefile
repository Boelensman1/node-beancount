INSTALL_DEPS=node_modules
SRC_FILES=$(shell find src/)

node_modules: package.json pnpm-lock.yaml
	pnpm install --frozen-lockfile
	@if [ -e node_modules ]; then touch node_modules; fi

clean:
	rm -rf node_modules

build: $(INSTALL_DEPS) $(SRC_FILES) tsconfig.json tsconfig.build.json
	pnpm exec tsc --project ./tsconfig.build.json

dev: $(INSTALL_DEPS)
	pnpm exec tsx --watch src/main.mts

install: $(INSTALL_DEPS)

test: $(INSTALL_DEPS)
	pnpm exec vitest run

test-watch: $(INSTALL_DEPS)
	pnpm exec vitest

lint: $(INSTALL_DEPS)
	pnpm exec prettier --check .
	pnpm exec tsc --noEmit
	pnpm exec eslint .
	pnpm exec typedoc --emit none

benchmark: $(INSTALL_DEPS) build
	node ./build/src/benchmark.mjs

docs: $(INSTALL_DEPS)
	pnpm exec typedoc

publish: $(INSTALL_DEPS) lint test build
	pnpm publish

.PHONY: dev install clean lint test benchmark docs
