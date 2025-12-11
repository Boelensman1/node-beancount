INSTALL_DEPS=node_modules
SRC_FILES=$(shell find src/)

node_modules: package.json
	npm ci
	@if [ -e node_modules ]; then touch node_modules; fi

clean:
	rm -rf node_modules

build: $(INSTALL_DEPS) $(SRC_FILES) tsconfig.json tsconfig.build.json
	npx tsc --project ./tsconfig.build.json

dev: $(INSTALL_DEPS)
	npx --no-install tsx --watch src/main.mts

install: $(INSTALL_DEPS)

test: $(INSTALL_DEPS)
	npx vitest run

test-watch: $(INSTALL_DEPS)
	npx vitest

lint: $(INSTALL_DEPS)
	npx --no-install prettier --check .
	npx --no-install tsc --noEmit
	npx --no-install eslint .
	npx --no-install typedoc --emit none

benchmark: $(INSTALL_DEPS) build
	node ./build/src/benchmark.mjs

docs: $(INSTALL_DEPS)
	npx --no-install typedoc

publish: $(INSTALL_DEPS) build test
	npm publish

.PHONY: dev install clean lint test benchmark docs
